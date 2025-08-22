# Contributing to Homebridge AHOY-DTU Plugin

Thank you for your interest in contributing to the Homebridge AHOY-DTU plugin! We welcome contributions from the community and appreciate your help in making this project better.

## 🚀 Getting Started

### Prerequisites

- **Node.js** >=14.18.1
- **npm** (comes with Node.js)
- **Git** for version control
- **Homebridge** installed for testing
- **AHOY-DTU device** or MQTT test environment

### Development Setup

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/homebridge-ahoy-dtu.git
   cd homebridge-ahoy-dtu
   ```

3. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Create a development branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

5. **Build the project**:
   ```bash
   npm run build
   ```

6. **Start development server**:
   ```bash
   npm run dev
   ```

## 🔧 Development Workflow

### Project Structure

```
homebridge-ahoy-dtu/
├── src/
│   └── index.ts              # Main plugin code
├── dist/                     # Compiled JavaScript (auto-generated)
├── config.schema.json        # Homebridge UI configuration
├── README.md                 # Main documentation
├── INSTALL.md               # Installation guide
├── package.json             # Project configuration
└── tsconfig.json            # TypeScript configuration
```

### Available Scripts

- `npm run build` - Compile TypeScript to JavaScript
- `npm run watch` - Watch for changes and auto-compile
- `npm run dev` - Development server with auto-reload
- `npm run clean` - Remove compiled files
- `npm run lint` - Run code linting (if configured)

### Testing Your Changes

1. **Build the plugin**:
   ```bash
   npm run build
   ```

2. **Install locally for testing**:
   ```bash
   npm install -g .
   ```

3. **Test with Homebridge**:
   - Configure the plugin in your Homebridge config
   - Restart Homebridge
   - Check logs for any errors
   - Test functionality in HomeKit

4. **Uninstall test version**:
   ```bash
   npm uninstall -g homebridge-ahoy-dtu
   ```

## 📝 Code Standards

### TypeScript Guidelines

- Use **TypeScript** for all new code
- Follow existing code style and patterns
- Add **type annotations** where helpful
- Use **interfaces** for complex objects
- Follow **ESLint** rules (if configured)

### Code Style

```typescript
// Use clear, descriptive variable names
const mqttClient: mqtt.MqttClient | null = null;

// Add JSDoc comments for public methods
/**
 * Handles incoming MQTT messages and updates HomeKit accessories
 * @param topic - MQTT topic name
 * @param message - Message payload as string
 */
private handleMqttMessage(topic: string, message: string): void {
  // Implementation here
}

// Use consistent error handling
try {
  // Risky operation
} catch (error) {
  this.log.error('Operation failed:', error);
}
```

### Logging Standards

```typescript
// Use appropriate log levels
this.log.debug('Detailed debugging info');
this.log.info('General information');
this.log.warn('Warning about potential issues');
this.log.error('Error that needs attention');

// Include context in messages
this.log.info('Connected to MQTT broker:', mqttUrl);
this.log.error('Failed to subscribe to topic:', topic, error);
```

## 🐛 Reporting Issues

### Before Reporting

1. **Check existing issues** to avoid duplicates
2. **Update to latest version** and test again
3. **Check documentation** for known solutions
4. **Test with minimal configuration** to isolate the issue

### Issue Template

When reporting bugs, please include:

```markdown
**Bug Description**
A clear description of what the bug is.

**Environment**
- Plugin version: [e.g., 1.0.0]
- Homebridge version: [e.g., 1.6.0]
- Node.js version: [e.g., 16.14.0]
- Operating system: [e.g., Ubuntu 20.04]

**Configuration**
```json
{
  "platform": "AhoyDTU",
  // Your configuration (remove sensitive data)
}
```

**Steps to Reproduce**
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected Behavior**
What you expected to happen.

**Actual Behavior**
What actually happened.

**Logs**
```
Relevant log entries here
```

**Additional Context**
Any other context about the problem.
```

## 🚀 Feature Requests

### Suggesting Features

1. **Check existing issues** for similar requests
2. **Describe the use case** - why is this needed?
3. **Provide examples** of how it would work
4. **Consider backward compatibility**

### Feature Request Template

```markdown
**Feature Description**
Clear description of the proposed feature.

**Use Case**
Why is this feature needed? What problem does it solve?

**Proposed Solution**
How would you like this to be implemented?

**Alternatives Considered**
What other approaches have you considered?

**Additional Context**
Any other context, mockups, or examples.
```

## 🔄 Pull Request Process

### Before Submitting

1. **Test thoroughly** with your AHOY-DTU setup
2. **Update documentation** if needed
3. **Add/update tests** if applicable
4. **Follow code standards** outlined above
5. **Keep commits focused** and well-described

### Pull Request Template

```markdown
**Description**
Brief description of changes made.

**Related Issue**
Fixes #[issue number]

**Type of Change**
- [ ] Bug fix (non-breaking change)
- [ ] New feature (non-breaking change)
- [ ] Breaking change (would cause existing functionality to change)
- [ ] Documentation update

**Testing**
- [ ] Tested with actual AHOY-DTU device
- [ ] Tested GUI configuration
- [ ] Tested offline detection
- [ ] No console errors

**Checklist**
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Documentation updated if needed
- [ ] No breaking changes without discussion
```

### Review Process

1. **Automated checks** must pass
2. **Code review** by maintainers
3. **Testing** with real AHOY-DTU setup (if possible)
4. **Documentation review** for user-facing changes
5. **Merge** when approved

## 📚 Documentation

### When to Update Documentation

- **New features** or configuration options
- **Changed behavior** or breaking changes
- **New setup requirements** or dependencies
- **Troubleshooting information** or FAQ updates

### Documentation Files

- **README.md** - Main user documentation
- **INSTALL.md** - Installation instructions
- **config.schema.json** - GUI configuration
- **Code comments** - Inline documentation

## 🏷️ Release Process

### Version Numbering

We follow [Semantic Versioning](https://semver.org/):
- **MAJOR.MINOR.PATCH** (e.g., 1.2.3)
- **MAJOR** - Breaking changes
- **MINOR** - New features (backward compatible)
- **PATCH** - Bug fixes (backward compatible)

### Release Checklist

1. **Update version** in package.json
2. **Update CHANGELOG.md** with new features/fixes
3. **Test thoroughly** across different setups
4. **Build and verify** package contents
5. **Create GitHub release** with notes
6. **Publish to npm** registry

## 🤝 Community Guidelines

### Be Respectful

- **Be kind** and respectful to all contributors
- **Be patient** with newcomers and questions
- **Be constructive** in feedback and criticism
- **Be collaborative** in problem-solving

### Communication

- **Use clear, descriptive titles** for issues and PRs
- **Provide context** and examples when possible
- **Ask questions** if requirements are unclear
- **Share knowledge** and help others learn

## 🛡️ Security

### Reporting Security Issues

If you discover a security vulnerability, please:

1. **Do NOT** open a public issue
2. **Email maintainers** directly (if contact available)
3. **Provide details** about the vulnerability
4. **Allow time** for fix before disclosure

### Security Considerations

- **MQTT credentials** handling
- **Network security** requirements
- **Input validation** for user data
- **Dependencies** security updates

## 📞 Getting Help

### Where to Ask Questions

- **GitHub Issues** - For bugs and feature requests
- **GitHub Discussions** - For general questions and ideas
- **Homebridge Discord** - For community support
- **Documentation** - Check existing guides first

### Response Time

- **Issues** - We aim to respond within 48 hours
- **Pull Requests** - Initial review within a week
- **Security issues** - Immediate attention

---

Thank you for contributing to the Homebridge AHOY-DTU plugin! Your help makes this project better for everyone in the solar and smart home communities. 🌞