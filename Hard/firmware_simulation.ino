#include <Wire.h> 
#include <LiquidCrystal_I2C.h>
#include <SoftwareSerial.h> 

// --- 1. CONFIGURATION DES BROCHES ---
const int pinBouton = 2;
const int pinRouge  = 3;  
const int pinVert   = 5;  
const int pinRelais = 9; 

const int pinBTRX = 4; 
const int pinBTTX = 6;

// --- 2. OBJETS ---
LiquidCrystal_I2C lcd(0x27, 16, 2);  
SoftwareSerial monBluetooth(pinBTRX, pinBTTX); 

// --- 3. VARIABLES ET CONSTANTES ---
int etatBoutonActuel = 0;
int etatBoutonPrecedent = LOW;
bool systemeAllume = false; 

const int RELAIS_ACTIVE = HIGH;   
const int RELAIS_ETEINT = LOW;    
const int SEUIL_OXYGENE = 70; 

// Timers (Intervalles)
unsigned long lastUpdateFC  = 0;
unsigned long lastUpdateO2  = 0;
unsigned long lastUpdateBat = 0;

const long intervalleFC  = 1000;  // 1 seconde
const long intervalleO2  = 30000; // 30 secondes
const long intervalleBat = 60000; // 60 secondes

// Variables de simulation
int valRyt = 80;   // Valeur de départ FC
int valOxy = 98;   // Valeur de départ O2
int valBat = 100;  // Valeur de départ Batterie
bool alternerOxygene = false; 

void setup() {
  Serial.begin(9600);      
  monBluetooth.begin(9600); 
  
  pinMode(pinBouton, INPUT); 
  pinMode(pinRouge, OUTPUT);
  pinMode(pinVert, OUTPUT);
  pinMode(pinRelais, OUTPUT);
  
  digitalWrite(pinRelais, RELAIS_ETEINT); 

  lcd.init();
  lcd.backlight();
  
  randomSeed(analogRead(0));

  delay(1000); 
  afficherMessageEteint(); 
}

void loop() {
  // --- A. GESTION DU BOUTON ---
  etatBoutonActuel = digitalRead(pinBouton);

  if (etatBoutonActuel != etatBoutonPrecedent) {
    if (etatBoutonActuel == HIGH) {
      systemeAllume = !systemeAllume; 

      if (systemeAllume) {
        // Réinitialisation des valeurs à l'allumage
        valBat = 100;
        valRyt = 80;
        valOxy = 96;
        unsigned long current = millis();
        lastUpdateFC = current;
        lastUpdateO2 = current;
        lastUpdateBat = current;
        
        lcd.clear();
        lcd.setCursor(0, 0);
        lcd.print("FC   O2   BAT"); 
      } else {
        afficherMessageEteint();    
      }
    }
    delay(50); 
  }
  etatBoutonPrecedent = etatBoutonActuel;

  // --- B. FONCTIONNEMENT DU SYSTÈME ---
  if (systemeAllume) {
    digitalWrite(pinVert, HIGH);
    digitalWrite(pinRouge, LOW);

    unsigned long tempsActuel = millis();

    // 1. MISE À JOUR RYTHME CARDIAQUE (Chaque 1s) - Comportement réaliste
    if (tempsActuel - lastUpdateFC >= intervalleFC) {
      lastUpdateFC = tempsActuel;
      
      // Variation fluide : +/- 3 bpm
      valRyt += random(-3, 4); 
      
      // Contraintes (80 à 170 bpm)
      if (valRyt < 80) valRyt = 80;
      if (valRyt > 170) valRyt = 170;

      actualiserAffichageEtUSB();
    }

    // 2. MISE À JOUR OXYGÈNE (Chaque 30s)
    if (tempsActuel - lastUpdateO2 >= intervalleO2) {
      lastUpdateO2 = tempsActuel;
      
      if (alternerOxygene) {
        valOxy = random(82, 98);   // Stable
        alternerOxygene = false;
      } else {
        valOxy = random(40, 65);   // Alerte
        alternerOxygene = true;
      }
    }

    // 3. MISE À JOUR BATTERIE (Chaque 60s)
    if (tempsActuel - lastUpdateBat >= intervalleBat) {
      lastUpdateBat = tempsActuel;
      if (valBat > 0) valBat--;
    }

    // 4. LOGIQUE ÉLECTROVANNE (Vérifiée en continu)
    if (valOxy < SEUIL_OXYGENE) {
      digitalWrite(pinRelais, RELAIS_ACTIVE);
    } else {
      digitalWrite(pinRelais, RELAIS_ETEINT);
    }

  } else {
    digitalWrite(pinVert, LOW);
    digitalWrite(pinRouge, HIGH);
    digitalWrite(pinRelais, RELAIS_ETEINT);
  }
}

void actualiserAffichageEtUSB() {
  // Calcul de l'état vanne pour les logs
  int etatVanneNum = (digitalRead(pinRelais) == RELAIS_ACTIVE) ? 1 : 0;

  // Affichage LCD
  lcd.setCursor(0, 1);
  lcd.print(valRyt); lcd.print("  "); 
  lcd.setCursor(5, 1);
  lcd.print(valOxy); lcd.print("%  "); 
  lcd.setCursor(10, 1);
  lcd.print(valBat); lcd.print("%   ");

  // Envoi USB (Format CSV pour base de données)
  Serial.print(valRyt); Serial.print(";");
  Serial.print(valOxy); Serial.print(";");
  Serial.print(valBat); Serial.print(";");
  Serial.println(etatVanneNum);

  // Envoi Bluetooth
  monBluetooth.print("FC:"); monBluetooth.print(valRyt);
  monBluetooth.print(" O2:"); monBluetooth.print(valOxy);
  monBluetooth.print("% Bat:"); monBluetooth.println(valBat);
}

void afficherMessageEteint() {
  lcd.clear();
  lcd.setCursor(4, 0); 
  lcd.print("SYSTEME");
  lcd.setCursor(5, 1);
  lcd.print("ETEINT");
}