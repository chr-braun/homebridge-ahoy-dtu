# Contributing to Homebridge AHOY-DTU

Vielen Dank für dein Interesse, zu Homebridge AHOY-DTU beizutragen! 🎉

## Wie du beitragen kannst

### 🐛 Bug Reports
- Verwende das [GitHub Issue Template](https://github.com/chr-braun/homebridge-ahoy-dtu/issues/new?template=bug_report.md)
- Beschreibe das Problem so detailliert wie möglich
- Füge Logs und Screenshots hinzu
- Gib deine Homebridge- und Plugin-Version an

### ✨ Feature Requests
- Verwende das [GitHub Issue Template](https://github.com/chr-braun/homebridge-ahoy-dtu/issues/new?template=feature_request.md)
- Beschreibe das gewünschte Feature
- Erkläre, warum es nützlich wäre
- Gib Beispiele für die Verwendung an

### 🔧 Code Contributions

1. **Forke das Repository**
   ```bash
   git clone https://github.com/dein-username/homebridge-ahoy-dtu.git
   cd homebridge-ahoy-dtu
   ```

2. **Installiere Dependencies**
   ```bash
   npm install
   ```

3. **Erstelle einen Feature-Branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

4. **Mache deine Änderungen**
   - Schreibe sauberen, kommentierten Code
   - Folge den bestehenden Code-Standards
   - Teste deine Änderungen gründlich

5. **Baue das Plugin**
   ```bash
   npm run build
   ```

6. **Teste das Plugin**
   ```bash
   npm test
   ```

7. **Commite deine Änderungen**
   ```bash
   git add .
   git commit -m "Add amazing feature"
   ```

8. **Pushe zum Branch**
   ```bash
   git push origin feature/amazing-feature
   ```

9. **Öffne einen Pull Request**
   - Beschreibe deine Änderungen
   - Verlinke relevante Issues
   - Füge Screenshots hinzu, wenn nötig

## Code-Standards

- **TypeScript**: Verwende TypeScript für alle neuen Dateien
- **ESLint**: Folge den ESLint-Regeln
- **Kommentare**: Kommentiere komplexe Logik
- **Namen**: Verwende aussagekräftige Variablen- und Funktionsnamen
- **Tests**: Schreibe Tests für neue Features

## Pull Request Guidelines

- **Titel**: Verwende einen aussagekräftigen Titel
- **Beschreibung**: Beschreibe, was geändert wurde und warum
- **Tests**: Stelle sicher, dass alle Tests bestehen
- **Dokumentation**: Aktualisiere die README, wenn nötig
- **Breaking Changes**: Markiere Breaking Changes deutlich

## Entwicklungsumgebung

### Voraussetzungen
- Node.js 18.15.0 oder höher
- npm 8.0.0 oder höher
- Git

### Setup
```bash
# Repository klonen
git clone https://github.com/chr-braun/homebridge-ahoy-dtu.git
cd homebridge-ahoy-dtu

# Dependencies installieren
npm install

# Plugin bauen
npm run build

# Tests ausführen
npm test

# Plugin verlinken für lokale Tests
npm link
```

### Lokales Testen
```bash
# In einem anderen Terminal
homebridge -D -C test-config.json
```

## Community

- **Discussions**: [GitHub Discussions](https://github.com/chr-braun/homebridge-ahoy-dtu/discussions)
- **Issues**: [GitHub Issues](https://github.com/chr-braun/homebridge-ahoy-dtu/issues)
- **Wiki**: [GitHub Wiki](https://github.com/chr-braun/homebridge-ahoy-dtu/wiki)

## Lizenz

Durch das Beitragen zu diesem Projekt stimmst du zu, dass deine Beiträge unter der MIT-Lizenz lizenziert werden.

## Vielen Dank! 🙏

Jeder Beitrag, egal wie klein, ist willkommen und wird geschätzt!