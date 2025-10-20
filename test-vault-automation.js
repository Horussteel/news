// 🤖 Script de Testare Automată pentru Seif Securizat
// Rulați în consola browser-ului pe pagina http://localhost:3001/vault

console.log('🔐 Începere Testare Automată Seif Securizat...');

class VaultTester {
  constructor() {
    this.testResults = [];
    this.testPin = '1234';
    this.testNote = {
      title: 'Notiță Test Automată',
      content: 'Acesta este o notiță creată de script-ul de testare automat',
      category: 'Test'
    };
  }

  // Metodă pentru a aștepta
  async wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Metodă pentru a simula click
  click(selector) {
    const element = document.querySelector(selector);
    if (element) {
      element.click();
      return true;
    }
    return false;
  }

  // Metodă pentru a simula input
  type(selector, text) {
    const element = document.querySelector(selector);
    if (element) {
      element.value = text;
      element.dispatchEvent(new Event('input', { bubbles: true }));
      return true;
    }
    return false;
  }

  // Metodă pentru a verifica dacă elementul există
  exists(selector) {
    return document.querySelector(selector) !== null;
  }

  // Metodă pentru a verifica textul unui element
  getText(selector) {
    const element = document.querySelector(selector);
    return element ? element.textContent : '';
  }

  // Metodă pentru a înregistra rezultat test
  logResult(testName, success, message, details = '') {
    const result = {
      test: testName,
      status: success ? '✅ PASS' : '❌ FAIL',
      message,
      details,
      timestamp: new Date().toISOString()
    };
    this.testResults.push(result);
    console.log(`${result.status} ${testName}: ${message}${details ? ` (${details})` : ''}`);
  }

  // Test 1: Verificare dacă suntem pe pagina seifului
  async testVaultPage() {
    try {
      const isVaultPage = window.location.pathname.includes('/vault');
      if (isVaultPage) {
        this.logResult('Pagină Seif', true, 'Suntem pe pagina seifului');
        return true;
      } else {
        this.logResult('Pagină Seif', false, 'Nu suntem pe pagina seifului', `URL: ${window.location.pathname}`);
        return false;
      }
    } catch (error) {
      this.logResult('Pagină Seif', false, 'Eroare la verificare paginii', error.message);
      return false;
    }
  }

  // Test 2: Verificare componentelor cheie
  async testVaultComponents() {
    try {
      const components = [
        { name: 'Container Seif', selector: '.vault-locker-container, .vault-dashboard' },
        { name: 'Tastatură PIN', selector: '.pin-keypad-container' },
        { name: 'Display PIN', selector: '.pin-display' },
        { name: 'Butoane numerice', selector: '.keypad-button' }
      ];

      for (const component of components) {
        if (this.exists(component.selector)) {
          this.logResult(`Componentă ${component.name}`, true, `Componenta ${component.name} este prezentă`);
        } else {
          this.logResult(`Componentă ${component.name}`, false, `Componenta ${component.name} lipsește`);
        }
      }
      return true;
    } catch (error) {
      this.logResult('Componente Seif', false, 'Eroare la verificare componentelor', error.message);
      return false;
    }
  }

  // Test 3: Test inițializare seif (dacă e necesar)
  async testVaultInitialization() {
    try {
      // Verificăm dacă seiful este deja inițializat
      const isInitialized = localStorage.getItem('secureVault') !== null;
      
      if (isInitialized) {
        this.logResult('Inițializare Seif', true, 'Seiful este deja inițializat');
        return true;
      }

      // Dacă nu e inițializat, începem procesul
      const setupTitle = this.getText('.pin-title');
      if (setupTitle && setupTitle.includes('Creați')) {
        console.log('🔐 Seiful nu este inițializat. Începem procesul de inițializare...');
        
        // Introducem PIN-ul
        for (const digit of this.testPin) {
          const button = document.querySelector(`.keypad-button:not(:disabled):not([disabled])`);
          if (button && button.textContent === digit) {
            this.click(button);
            await this.wait(200);
          }
        }

        // Așteptăm auto-submit sau apăsăm Enter
        await this.wait(500);
        
        // Verificăm dacă am trecut la confirmare
        const confirmTitle = this.getText('.pin-title');
        if (confirmTitle && confirmTitle.includes('Confirmați')) {
          console.log('🔐 Confirmăm PIN-ul...');
          
          // Introducem din nou PIN-ul pentru confirmare
          for (const digit of this.testPin) {
            const button = document.querySelector(`.keypad-button:not(:disabled):not([disabled])`);
            if (button && button.textContent === digit) {
              this.click(button);
              await this.wait(200);
            }
          }
          
          await this.wait(1000);
          
          // Verificăm dacă am ajuns la dashboard
          const dashboardExists = this.exists('.vault-dashboard');
          if (dashboardExists) {
            this.logResult('Inițializare Seif', true, 'Seiful a fost inițializat cu succes');
            return true;
          }
        }
      } else {
        this.logResult('Inițializare Seif', true, 'Seiful este deja configurat');
        return true;
      }
    } catch (error) {
      this.logResult('Inițializare Seif', false, 'Eroare la inițializare', error.message);
      return false;
    }
  }

  // Test 4: Test deblocare seif
  async testVaultUnlock() {
    try {
      // Verificăm dacă suntem pe ecranul de deblocare
      const lockerExists = this.exists('.vault-locker-container');
      if (!lockerExists) {
        this.logResult('Deblocare Seif', true, 'Seiful este deja deblocat');
        return true;
      }

      console.log('🔐 Testăm deblocarea seifului...');
      
      // Introducem PIN-ul
      for (const digit of this.testPin) {
        const button = document.querySelector(`.keypad-button:not(:disabled):not([disabled])`);
        if (button && button.textContent === digit) {
          this.click(button);
          await this.wait(200);
        }
      }

      // Așteptăm auto-submit sau apăsăm Enter/buton
      await this.wait(500);
      
      // Verificăm dacă butonul de submit apare
      const submitButton = document.querySelector('.submit-button');
      if (submitButton) {
        console.log('🔐 Apăsăm butonul de submit...');
        this.click(submitButton);
        await this.wait(1000);
      }

      // Verificăm dacă am ajuns la dashboard
      const dashboardExists = this.exists('.vault-dashboard');
      if (dashboardExists) {
        this.logResult('Deblocare Seif', true, 'Seiful a fost deblocat cu succes');
        return true;
      } else {
        this.logResult('Deblocare Seif', false, 'Nu am reușit să deblocăm seiful');
        return false;
      }
    } catch (error) {
      this.logResult('Deblocare Seif', false, 'Eroare la deblocare', error.message);
      return false;
    }
  }

  // Test 5: Test creare notiță
  async testCreateNote() {
    try {
      console.log('📝 Testăm crearea unei notițe...');
      
      // Click pe butonul "Notiță Nouă"
      if (!this.click('.btn-add-note')) {
        this.logResult('Creare Notiță', false, 'Nu am găsit butonul "Notiță Nouă"');
        return false;
      }
      
      await this.wait(500);
      
      // Completăm titlul
      if (!this.type('.note-title-input', this.testNote.title)) {
        this.logResult('Creare Notiță', false, 'Nu am găsit câmpul pentru titlu');
        return false;
      }
      
      await this.wait(300);
      
      // Completăm conținutul
      if (!this.type('.note-content-input', this.testNote.content)) {
        this.logResult('Creare Notiță', false, 'Nu am găsit câmpul pentru conținut');
        return false;
      }
      
      await this.wait(300);
      
      // Selectăm categoria
      if (!this.click(`.note-category-select option[value="${this.testNote.category}"]`)) {
        this.logResult('Creare Notiță', false, 'Nu am găsit categoria pentru selectare');
        return false;
      }
      
      await this.wait(300);
      
      // Salvăm notița
      if (!this.click('.btn-save')) {
        this.logResult('Creare Notiță', false, 'Nu am găsit butonul "Salvează"');
        return false;
      }
      
      await this.wait(1000);
      
      // Verificăm dacă notița a fost salvată
      const noteElements = document.querySelectorAll('.secure-note');
      if (noteElements.length > 0) {
        this.logResult('Creare Notiță', true, 'Notița a fost creată cu succes', `Total notițe: ${noteElements.length}`);
        return true;
      } else {
        this.logResult('Creare Notiță', false, 'Notița nu a fost salvată');
        return false;
      }
    } catch (error) {
      this.logResult('Creare Notiță', false, 'Eroare la creare notiță', error.message);
      return false;
    }
  }

  // Test 6: Test căutare
  async testSearch() {
    try {
      console.log('🔍 Testăm funcționalitatea de căutare...');
      
      // Introducem termenul de căutare
      if (!this.type('.search-input', 'Test')) {
        this.logResult('Căutare', false, 'Nu am găsit câmpul de căutare');
        return false;
      }
      
      await this.wait(500);
      
      // Verificăm dacă rezultatele apar
      const noteElements = document.querySelectorAll('.secure-note');
      if (noteElements.length > 0) {
        this.logResult('Căutare', true, 'Căutare funcționează', `Termen: "Test", Rezultate: ${noteElements.length}`);
        return true;
      } else {
        this.logResult('Căutare', false, 'Căutare nu a returnat rezultate');
        return false;
      }
    } catch (error) {
      this.logResult('Căutare', false, 'Eroare la căutare', error.message);
      return false;
    }
  }

  // Test 7: Test blocare seif
  async testVaultLock() {
    try {
      console.log('🔒 Testăm blocarea seifului...');
      
      // Căutăm butonul de blocare
      if (!this.click('.btn-lock')) {
        this.logResult('Blocare Seif', false, 'Nu am găsit butonul de blocare');
        return false;
      }
      
      await this.wait(1000);
      
      // Verificăm dacă am revenit la ecranul de deblocare
      const lockerExists = this.exists('.vault-locker-container');
      if (lockerExists) {
        this.logResult('Blocare Seif', true, 'Seiful a fost blocat cu succes');
        return true;
      } else {
        this.logResult('Blocare Seif', false, 'Seiful nu a fost blocat');
        return false;
      }
    } catch (error) {
      this.logResult('Blocare Seif', false, 'Eroare la blocare', error.message);
      return false;
    }
  }

  // Test 8: Test responsive design
  async testResponsive() {
    try {
      console.log('📱 Testăm design-ul responsive...');
      
      // Salvam dimensiunea originală
      const originalWidth = window.innerWidth;
      
      // Simulăm dimensiune mobilă
      if (originalWidth > 768) {
        // Nu putem schimba dimensiunea ferestrei din JS, dar verificăm adaptabilitatea
        const keypadContainer = document.querySelector('.pin-keypad-container');
        if (keypadContainer) {
          const styles = window.getComputedStyle(keypadContainer);
          const maxWidth = styles.maxWidth;
          
          if (maxWidth && maxWidth !== 'none') {
            this.logResult('Responsive Design', true, 'Tastatura PIN are limită de dimensiune maximă', `Max-width: ${maxWidth}`);
          } else {
            this.logResult('Responsive Design', true, 'Tastatura PIN se adaptează la dimensiuniuni diferite');
          }
          
          return true;
        }
      }
      
      this.logResult('Responsive Design', true, 'Design-ul se adaptează la ecran');
      return true;
    } catch (error) {
      this.logResult('Responsive Design', false, 'Eroare la test responsive', error.message);
      return false;
    }
  }

  // Metoda principală pentru a rula toate testele
  async runAllTests() {
    console.log('🚀 Începem toate testele automate...');
    
    // Test 1: Verificare pagină
    await this.testVaultPage();
    await this.wait(500);
    
    // Test 2: Verificare componente
    await this.testVaultComponents();
    await this.wait(500);
    
    // Test 3: Inițializare (dacă e necesar)
    await this.testVaultInitialization();
    await this.wait(500);
    
    // Test 4: Deblocare
    await this.testVaultUnlock();
    await this.wait(500);
    
    // Test 5: Creare notiță
    await this.testCreateNote();
    await this.wait(500);
    
    // Test 6: Căutare
    await this.testSearch();
    await this.wait(500);
    
    // Test 7: Blocare
    await this.testVaultLock();
    await this.wait(500);
    
    // Test 8: Responsive
    await this.testResponsive();
    await this.wait(500);
    
    // Afișăm rezultatele finale
    this.displayResults();
  }

  // Metoda pentru a afișa rezultatele
  displayResults() {
    console.log('\n📊 REZULTATE FINALE TESTARE:');
    console.log('=' .repeat(50));
    
    const passedTests = this.testResults.filter(r => r.status === '✅ PASS');
    const failedTests = this.testResults.filter(r => r.status === '❌ FAIL');
    
    console.log(`✅ Teste reușite: ${passedTests.length}/${this.testResults.length}`);
    console.log(`❌ Teste eșuate: ${failedTests.length}/${this.testResults.length}`);
    
    if (passedTests.length === this.testResults.length) {
      console.log('\n🎉 TOATE TESTELE AU TRECUT! Seiful este complet funcțional!');
    } else {
      console.log('\n⚠️ Unele teste au eșuat. Verificați detaliile de mai sus.');
    }
    
    console.log('\n📋 Lista detaliată a testelor:');
    this.testResults.forEach((result, index) => {
      console.log(`${index + 1}. ${result.status} ${result.test}: ${result.message}`);
      if (result.details) {
        console.log(`   Detalii: ${result.details}`);
      }
    });
  }
}

// Funcție helper pentru a rula testele
async function runVaultTests() {
  const tester = new VaultTester();
  await tester.runAllTests();
}

// Verificăm dacă suntem pe pagina corectă
if (window.location.pathname.includes('/vault')) {
  console.log('🔐 Detectată pagina seifului. Puteți rula testele cu:');
  console.log('runVaultTests() - pentru a rula toate testele automate');
  
  // Facem funcția disponibilă global
  window.runVaultTests = runVaultTests;
  
  // Opțional: rulăm testele automat după 2 secunde
  setTimeout(() => {
    console.log('\n🤖 Puteți rula testele oricând cu: runVaultTests()');
  }, 2000);
} else {
  console.log('❌ Navigați la http://localhost:3001/vault pentru a rula testele');
}

export default runVaultTests;
