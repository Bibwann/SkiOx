#include <Wire.h> 
#include <LiquidCrystal_I2C.h>
#include <SoftwareSerial.h> 

const char CLE_BT[] = "8qabEK1RS8ipG!XKv&gDxKXf&tNNQz";

// ---------- FONCTION DE CHIFFREMENT XOR ----------
void chiffrerXOR(char* data) {
  int keyLen = strlen(CLE_BT);
  for (int i = 0; data[i] != '\0'; i++) {
    data[i] ^= CLE_BT[i % keyLen];
  }
}

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

unsigned long lastUpdateFC  = 0;
unsigned long lastUpdateO2  = 0;
unsigned long lastUpdateBat = 0;

const long intervalleFC  = 1000;
const long intervalleO2  = 30000;
const long intervalleBat = 60000;

int valRyt = 80;
int valOxy = 98;
int valBat = 100;
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
  etatBoutonActuel = digitalRead(pinBouton);

  if (etatBoutonActuel != etatBoutonPrecedent) {
    if (etatBoutonActuel == HIGH) {
      systemeAllume = !systemeAllume; 
      if (systemeAllume) {
        valBat = 100; valRyt = 80; valOxy = 96;
        unsigned long current = millis();
        lastUpdateFC = current; lastUpdateO2 = current; lastUpdateBat = current;
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

  if (systemeAllume) {
    digitalWrite(pinVert, HIGH);
    digitalWrite(pinRouge, LOW);
    unsigned long tempsActuel = millis();

    if (tempsActuel - lastUpdateFC >= intervalleFC) {
      lastUpdateFC = tempsActuel;
      valRyt += random(-3, 4); 
      if (valRyt < 80) valRyt = 80;
      if (valRyt > 170) valRyt = 170;
      actualiserAffichageEtUSB();
    }

    if (tempsActuel - lastUpdateO2 >= intervalleO2) {
      lastUpdateO2 = tempsActuel;
      if (alternerOxygene) { valOxy = random(82, 98); alternerOxygene = false; }
      else { valOxy = random(40, 65); alternerOxygene = true; }
    }

    if (tempsActuel - lastUpdateBat >= intervalleBat) {
      lastUpdateBat = tempsActuel;
      if (valBat > 0) valBat--;
    }

    if (valOxy < SEUIL_OXYGENE) digitalWrite(pinRelais, RELAIS_ACTIVE);
    else digitalWrite(pinRelais, RELAIS_ETEINT);

  } else {
    digitalWrite(pinVert, LOW);
    digitalWrite(pinRouge, HIGH);
    digitalWrite(pinRelais, RELAIS_ETEINT);
  }
}

void actualiserAffichageEtUSB() {
  int etatVanneNum = (digitalRead(pinRelais) == RELAIS_ACTIVE) ? 1 : 0;

  // Affichage LCD (reste en clair pour l'utilisateur)
  lcd.setCursor(0, 1);
  lcd.print(valRyt); lcd.print("  "); 
  lcd.setCursor(5, 1);
  lcd.print(valOxy); lcd.print("%  "); 
  lcd.setCursor(10, 1);
  lcd.print(valBat); lcd.print("%   ");

  // ---------- ENVOI USB (Chiffré) ----------
  char messageUSB[64] = {0};
  sprintf(messageUSB, "%d;%d;%d;%d", valRyt, valOxy, valBat, etatVanneNum);
  int lenUSB = strlen(messageUSB); // On stocke la longueur avant chiffrement
  chiffrerXOR(messageUSB);
  
  // On utilise Serial.write pour envoyer les octets bruts
  Serial.write((uint8_t*)messageUSB, lenUSB);
  Serial.println(); // Saut de ligne pour séparer les envois

  // ---------- ENVOI BLUETOOTH (Chiffré) ----------
  char messageBT[64] = {0};
  sprintf(messageBT, "FC:%d O2:%d Bat:%d", valRyt, valOxy, valBat);
  int lenBT = strlen(messageBT);
  chiffrerXOR(messageBT);
  
  monBluetooth.write((uint8_t*)messageBT, lenBT);
  monBluetooth.println(); 
}

void afficherMessageEteint() {
  lcd.clear();
  lcd.setCursor(4, 0); 
  lcd.print("SYSTEME");
  lcd.setCursor(5, 1);
  lcd.print("ETEINT");
}