# 🚀 Release Guide

Dieser Guide erklärt, wie verschiedene Release-Typen für das `homebridge-ahoy-dtu` Plugin erstellt werden.

## 📋 Release-Typen

### 1. **Stable Release** (Produktionsversion)
- **Tag:** `latest`
- **Version:** `1.2.4`, `1.3.0`, `2.0.0`
- **Verwendung:** Für alle Benutzer, vollständig getestet
- **Installation:** `npm install -g homebridge-ahoy-dtu`

### 2. **Development Release** (Entwicklungsversion)
- **Tag:** `dev`
- **Version:** `1.2.5-dev.1`, `1.2.5-dev.2`
- **Verwendung:** Für Entwickler und Tester, neueste Features
- **Installation:** `npm install -g homebridge-ahoy-dtu@dev`

### 3. **Beta Release** (Betaversion)
- **Tag:** `beta`
- **Version:** `1.2.5-beta.1`, `1.2.5-beta.2`
- **Verwendung:** Für Beta-Tester, fast fertige Features
- **Installation:** `npm install -g homebridge-ahoy-dtu@beta`

### 4. **Release Candidate** (Kandidatenversion)
- **Tag:** `rc`
- **Version:** `1.2.5-rc.1`, `1.2.5-rc.2`
- **Verwendung:** Für finale Tests vor Stable Release
- **Installation:** `npm install -g homebridge-ahoy-dtu@rc`

## 🔧 Release erstellen

### **Development Release**
```bash
# Auf develop Branch
git checkout develop

# Development Version veröffentlichen
npm run dev:publish
```

### **Beta Release**
```bash
# Auf develop Branch
git checkout develop

# Beta Version veröffentlichen
npm run release:beta
```

### **Release Candidate**
```bash
# Auf develop Branch
git checkout develop

# RC Version veröffentlichen
npm run release:rc
```

### **Stable Release**
```bash
# Auf main Branch
git checkout main

# Patch Release (Bugfixes)
npm run release:patch

# Minor Release (Neue Features)
npm run release:minor

# Major Release (Breaking Changes)
npm run release:major
```

## 📝 Workflow

### **Entwicklung**
1. **Feature Branch** von `develop` erstellen
2. **Entwickeln** und testen
3. **Pull Request** zu `develop` erstellen
4. **Code Review** und Merge

### **Testing**
1. **Development Release** erstellen: `npm run dev:publish`
2. **Testen** der neuen Features
3. **Beta Release** bei gutem Fortschritt: `npm run release:beta`
4. **Weiter testen** und Feedback sammeln

### **Release**
1. **Release Candidate** erstellen: `npm run release:rc`
2. **Finale Tests** durchführen
3. **Stable Release** erstellen: `npm run release:patch/minor/major`
4. **Tag** zu GitHub pushen

## 🏷️ Git Tags

### **Automatische Tags**
- `v1.2.5-dev.1` → Development Release
- `v1.2.5-beta.1` → Beta Release  
- `v1.2.5-rc.1` → Release Candidate
- `v1.2.5` → Stable Release

### **Tag pushen**
```bash
# Alle Tags pushen
git push --tags

# Oder spezifischen Tag
git push origin v1.2.5
```

## 🔄 GitHub Actions

### **Automatische Releases**
- **Push Tag** → Automatischer Release
- **Manual Trigger** → Release über GitHub UI
- **Tests** → Automatische Tests vor Release
- **NPM Publish** → Automatisches Veröffentlichen

### **Secrets erforderlich**
- `NPM_TOKEN` → Für NPM-Veröffentlichung
- `GITHUB_TOKEN` → Für GitHub Releases

## 📊 Version Management

### **Semantic Versioning**
- **Patch** (1.2.4 → 1.2.5): Bugfixes
- **Minor** (1.2.4 → 1.3.0): Neue Features
- **Major** (1.2.4 → 2.0.0): Breaking Changes

### **Pre-release Versionen**
- **Development:** `1.2.5-dev.1`, `1.2.5-dev.2`
- **Beta:** `1.2.5-beta.1`, `1.2.5-beta.2`
- **RC:** `1.2.5-rc.1`, `1.2.5-rc.2`

## ⚠️ Wichtige Hinweise

### **Für Benutzer**
- **Stable** → Für alle Benutzer empfohlen
- **Dev/Beta/RC** → Nur für Tester und Entwickler
- **Breaking Changes** → Immer in Major Releases

### **Für Entwickler**
- **Tests** → Immer vor Release ausführen
- **Changelog** → Alle Änderungen dokumentieren
- **Breaking Changes** → Immer dokumentieren

## 🎯 Best Practices

1. **Entwicklung** immer auf `develop` Branch
2. **Tests** vor jedem Release durchführen
3. **Changelog** aktuell halten
4. **Breaking Changes** früh kommunizieren
5. **Stable Releases** nur nach ausreichendem Testing
