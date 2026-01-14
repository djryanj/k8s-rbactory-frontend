# Contributing to K8s RBACtory

Thank you for your interest in contributing to K8s RBACtory! We welcome contributions from the community and are grateful for your support in making this project better.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Message Guidelines](#commit-message-guidelines)
- [Pull Request Process](#pull-request-process)
- [Testing](#testing)
- [Documentation](#documentation)
- [Accessibility](#accessibility)
- [Getting Help](#getting-help)

## Code of Conduct

This project adheres to a Code of Conduct that all contributors are expected to follow. Review it [here](./CODE_OF_CONDUCT.md).

## Getting Started

### Prerequisites

- Node.js 24.x or higher (earlier versions may work but haven't been tested)
- npm 11.x or higher (earlier versions may work but haven't been tested)
- Git
- A code editor (VS Code recommended)

### Initial Setup

1. Fork the repository on GitHub
2. Clone your fork locally:

   ```bash
   git clone https://github.com/YOUR_USERNAME/k8s-rbactory-frontend.git
   cd k8s-rbactory-frontend
   ```

3. Add the upstream repository:

   ```bash
   git remote add upstream https://github.com/djryanj/k8s-rbactory-frontend.git
   ```

4. Install dependencies:

   ```bash
   npm install
   ```

5. Create a branch for your work:
   ```bash
   git checkout -b feature/your-feature-name
   ```

### Running the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

### Environment Configuration

Copy the example environment file and configure as needed:

```bash
cp .env.example .env.development
```

Key environment variables:

- `VITE_API_URL` - Backend API endpoint
- `VITE_FEATURE_CLUSTER_BROWSER` - Enable/disable cluster browser feature
- `VITE_NETLIFY_DEMO` - Enable demo mode messaging

## Development Workflow

### Branching Strategy

We follow a simplified Git workflow:

- `main` - Production-ready code
- `dev` - Integration branch for features (if applicable)
- `feature/*` - New features
- `fix/*` - Bug fixes
- `docs/*` - Documentation updates
- `refactor/*` - Code refactoring
- `test/*` - Test additions or modifications

### Keeping Your Fork Updated

Regularly sync your fork with the upstream repository:

```bash
git fetch upstream
git checkout main
git merge upstream/main
git push origin main
```

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Avoid `any` types; use proper type definitions
- Define interfaces for component props and complex data structures
- Use type inference where appropriate

### React

- Use functional components with hooks
- Follow the existing component structure
- Keep components focused and single-purpose
- Use meaningful component and variable names
- Implement proper error boundaries where appropriate

### Code Style

We use ESLint and Prettier for code formatting:

```bash
# Check for linting issues
npm run lint

# Auto-fix linting issues
npm run lint:fix

# Format code
npm run format
```

In addition, there is a helper script to ensure that all code files have a proper header attached:

```bash
# Header check
npm run check-headers

# Header fix
npm run fix-headers
```

Configure your editor to format on save for the best experience.

### Pre-Commit Hooks

We use pre-commit hooks to enforce code style. Or at least, we will, once they're written :)

### File Organization

```
src/
├── components/       # React components
│   ├── Component/
│   │   ├── Component.tsx
│   │   ├── index.ts
│   │   └── types.ts
├── context/         # React context providers
├── hooks/           # Custom React hooks
├── utils/           # Utility functions
├── types/           # TypeScript type definitions
└── styles/          # Global styles
```

## Commit Message Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification for commit messages. This leads to more readable messages and enables automated changelog generation. Review the documentation at that site for more information.

### Scope

The scope should specify the area of the codebase affected:

- `policy-builder` - Policy builder functionality
- `cluster-browser` - Cluster browser functionality
- `config` - Configuration management
- `ui` - User interface components
- `a11y` - Accessibility improvements

### Examples

```
feat(policy-builder): add support for custom resource definitions

Implements CRD support in the policy builder, allowing users to
create RBAC policies for custom Kubernetes resources.

Closes #123
```

```
fix(cluster-browser): resolve pagination issue with large namespaces

The pagination component was not correctly handling namespaces with
more than 100 resources. This fix implements proper cursor-based
pagination.

Fixes #456
```

```
docs(contributing): add commit message guidelines

Add detailed guidelines for writing conventional commit messages
to improve consistency across contributions.
```

## Pull Request Process

**IMPORTANT**: PRs should only contain a single atomic change. For example, if a React dependency update is required to enable a new feature, then the following fictional example PRs should be generated:

1. deps: update react to 19.0.0
1. fix(cluster-browser): fixed timeout on tab load

### Before Submitting

1. Ensure your branch is up to date with the main branch
1. Ensure your code follows the coding standards
1. Run the linter and fix any issues:
   ```bash
   npm run lint:fix
   ```
1. Run all tests and ensure they pass:
   ```bash
   npm test
   ```
1. Update documentation if necessary
1. Add tests for new features

### PR Title

Use the same format as commit messages:

```
<type>(<scope>): <description>
```

Examples:

- `feat(policy-builder): add namespace selector component`
- `fix(ui): correct dark mode color contrast issues`
- `docs(readme): update installation instructions`

### PR Template

This project has a PR template that must be used. If PR's deviate from the PR template significantly they will be closed.

### Squash Commits

This project will always use squash commits when merging to main.

### Review Process

1. At least one maintainer must review and approve the PR
2. All CI checks must pass
3. Address any feedback from reviewers
4. Once approved, a maintainer will merge your PR (squash commit)

### After Your PR is Merged

1. Delete your feature branch
2. Update your local repository:
   ```bash
   git checkout main
   git pull upstream main
   ```

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Writing Tests

- Write tests for all new features
- Maintain or improve code coverage
- Follow the existing test structure
- Use descriptive test names that explain what is being tested

### Test Organization

```typescript
describe("ComponentName", () => {
  describe("feature or method", () => {
    it("should do something specific", () => {
      // Test implementation
    });
  });
});
```

### Testing Best Practices

- Test user interactions, not implementation details
- Use `screen` queries from Testing Library
- Prefer `getByRole` and `getByLabelText` for accessibility
- Mock external dependencies appropriately
- Test error states and edge cases

## Documentation

### Code Documentation

- Add JSDoc comments for complex functions
- Document component props using TypeScript interfaces
- Include usage examples for reusable components
- Keep comments up to date with code changes

### README Updates

Update the README.md if your changes:

- Add new features
- Change installation or setup procedures
- Modify configuration options
- Affect how users interact with the application

## Accessibility

Accessibility is a core requirement for this project. All contributions must maintain or improve accessibility.

### Requirements

- All interactive elements must be keyboard accessible
- Provide appropriate ARIA labels and roles
- Maintain sufficient color contrast ratios
- Support screen readers
- Test with keyboard navigation
- Ensure focus management is correct

### Testing Accessibility

```bash
# Run accessibility linter
npm run lint:a11y
```

Manual testing:

1. Navigate the application using only the keyboard
2. Test with a screen reader (NVDA, JAWS, or VoiceOver)
3. Check color contrast using browser DevTools
4. Verify ARIA attributes are correct

### Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM Resources](https://webaim.org/resources/)

## Getting Help

### Communication Channels

- **GitHub Issues**: For bug reports and feature requests
- **GitHub Discussions**: For questions and general discussion
- **Pull Request Comments**: For code review and specific implementation questions

### Asking Questions

When asking for help:

1. Search existing issues and discussions first
2. Provide context and relevant details
3. Include code samples or error messages
4. Describe what you have already tried
5. Be respectful and patient

### Reporting Bugs

When reporting bugs, include:

1. A clear, descriptive title
2. Steps to reproduce the issue
3. Expected behavior
4. Actual behavior
5. Environment details (OS, browser, Node version)
6. Screenshots or error messages if applicable

Use the bug report template when creating an issue.

### Suggesting Features

When suggesting features:

1. Check if the feature has already been requested
2. Clearly describe the feature and its benefits
3. Provide use cases
4. Consider implementation complexity
5. Be open to discussion and alternatives

Use the feature request template when creating an issue.

## Recognition

Contributors will be recognized in the following ways:

- Listed in the project's contributors list
- Mentioned in release notes for significant contributions

## License

By contributing to K8s RBACtory, you agree that your contributions will be licensed under the Apache License 2.0, the same license as the project.

## Questions?

If you have questions about contributing that are not covered in this guide, please open a GitHub Discussion or reach out to the maintainers.

Thank you for contributing to K8s RBACtory!
