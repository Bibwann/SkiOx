#include <Wire.h> 
#include <LiquidCrystal_I2C.h>
#include <SoftwareSerial.h> 

// --- 1. CONFIGURATION DES BROCHES ---
const int pinBouton   = 2;
const int pinRouge    = 3;  
const int pinVert     = 5;  
const int pinRelais   = 9; 
const int potOxygene  = A3; // Potentiomètre réel pour l'O2

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
unsigned long lastUpdateBat = 0;

const long intervalleFC  = 1000;  // Mise à jour de l'affichage chaque seconde
const long intervalleBat = 60000; // Décharge batterie chaque minute

// Variables de simulation et capteurs
int valRyt = 80;   // Valeur de départ FC (Simulée)
int valOxy = 0;    // Valeur lue du potentiomètre A3
int valBat = 100;  // Valeur de départ Batterie (Simulée)

void setup() {
  Serial.begin(9600);      
  monBluetooth.begin(9600); 
  
  pinMode(pinBouton, INPUT); 
  pinMode(pinRouge, OUTPUT);
  pinMode(pinVert, OUTPUT);
  pinMode(pinRelais, OUTPUT);
  
  // Broche A3 en entrée
  pinMode(potOxygene, INPUT);

  digitalWrite(pinRelais, RELAIS_ETEINT); 

  lcd.init();
  lcd.backlight();
  
  randomSeed(analogRead(0));

  delay(1000); 
  afficherMessageEteint(); 
}

void loop() {
  // --- A. GESTION DU BOUTON ON/OFF ---
  etatBoutonActuel = digitalRead(pinBouton);

  if (etatBoutonActuel != etatBoutonPrecedent) {
    if (etatBoutonActuel == HIGH) {
      systemeAllume = !systemeAllume; 

      if (systemeAllume) {
        // Reset des valeurs à l'allumage
        valBat = 100;
        valRyt = 85; 
        unsigned long current = millis();
        lastUpdateFC = current;
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

    // 1. LECTURE RÉELLE DE L'OXYGÈNE (Potentiomètre A3)
    // On mappe la valeur de 0-1023 vers 0-100%
    valOxy = map(analogRead(potOxygene), 0, 1023, 0, 100);

    // 2. GESTION DU RYTHME CARDIAQUE (Chaque 1s) - Simulation fluide
    if (tempsActuel - lastUpdateFC >= intervalleFC) {
      lastUpdateFC = tempsActuel;
      
      // Variation de +/- 2 bpm pour le réalisme
      valRyt += random(-2, 3); 
      if (valRyt < 60) valRyt = 60;
      if (valRyt > 175) valRyt = 175;

      actualiserAffichageEtUSB();
    }

    // 3. GESTION DE LA BATTERIE (Chaque 60s)
    if (tempsActuel - lastUpdateBat >= intervalleBat) {
      lastUpdateBat = tempsActuel;
      if (valBat > 0) valBat--;
    }

    // 4. LOGIQUE ÉLECTROVANNE (Réaction immédiate à l'O2)
    if (valOxy < SEUIL_OXYGENE) {
      digitalWrite(pinRelais, RELAIS_ACTIVE);
    } else {
      digitalWrite(pinRelais, RELAIS_ETEINT);
    }

  } else {
    // Système éteint
    digitalWrite(pinVert, LOW);
    digitalWrite(pinRouge, HIGH);
    digitalWrite(pinRelais, RELAIS_ETEINT);
  }
}

void actualiserAffichageEtUSB() {
  int etatVanneNum = (digitalRead(pinRelais) == RELAIS_ACTIVE) ? 1 : 0;

  // Affichage LCD (Mise à jour toutes les secondes)
  lcd.setCursor(0, 1);
  lcd.print(valRyt); lcd.print("  "); 
  lcd.setCursor(5, 1);
  lcd.print(valOxy); lcd.print("%  "); 
  lcd.setCursor(10, 1);
  lcd.print(valBat); lcd.print("%   ");

  // Envoi USB (Format : Rythme;Oxygene;Batterie;Vanne)
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