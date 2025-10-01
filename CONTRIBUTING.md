# Contributing to fastly-object-storage

Thank you for your interest in contributing to the Fastly Object Storage SDK! We welcome contributions from the community.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/fastly-object-storage.git`
3. Create a new branch: `git checkout -b feature/your-feature-name`
4. Install dependencies: `npm install`

## Development Workflow

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Code Quality

```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Type check
npm run typecheck
```

### Building

```bash
# Build the project
npm run build

# Build in watch mode
npm run dev
```

## Code Standards

- **TypeScript**: Write all code in TypeScript with strict typing
- **No `any`**: Avoid using `any` type
- **Documentation**: Add JSDoc comments for all public APIs
- **Tests**: Write tests for new features and bug fixes
- **Formatting**: Use Prettier for code formatting
- **Linting**: Follow ESLint rules

## Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Test changes
- `chore:` - Build process or tooling changes

Examples:
```
feat: add support for custom retry policies
fix: handle empty response bodies in getObject
docs: update README with presigned URL examples
```

## Pull Request Process

1. Update the README.md with details of changes if applicable
2. Update the documentation with any new APIs
3. Add tests for new functionality
4. Ensure all tests pass: `npm test`
5. Ensure code is formatted: `npm run format`
6. Ensure no linting errors: `npm run lint`
7. Update the CHANGELOG.md (if applicable)
8. Request a review from maintainers

## Testing Guidelines

- Write unit tests for all new functions and classes
- Test edge cases and error conditions
- Mock external dependencies (S3 client)
- Aim for 80%+ code coverage
- Use descriptive test names

Example test structure:
```typescript
describe('FastlyStorageClient', () => {
  describe('uploadObject', () => {
    it('should upload a buffer successfully', async () => {
      // Arrange
      const client = new FastlyStorageClient(config);
      const buffer = Buffer.from('test data');

      // Act
      const result = await client.uploadObject('bucket', 'key', buffer);

      // Assert
      expect(result.etag).toBeDefined();
    });

    it('should throw error when bucket does not exist', async () => {
      // Test error case
    });
  });
});
```

## Documentation

- Add JSDoc comments to all public methods
- Include parameter descriptions
- Provide usage examples
- Document thrown errors

Example:
```typescript
/**
 * Uploads an object to storage.
 *
 * @param bucket - The bucket name
 * @param key - The object key
 * @param data - Data to upload
 * @param options - Upload options
 * @returns Upload result with ETag
 * @throws {FastlyStorageError} When upload fails
 *
 * @example
 * ```typescript
 * const result = await client.uploadObject('my-bucket', 'file.txt', buffer);
 * ```
 */
```

## Code Review

All submissions require review. We use GitHub pull requests for this purpose.

Reviewers will check:
- Code quality and style
- Test coverage
- Documentation
- Performance implications
- Security considerations

## Questions?

Feel free to open an issue for questions or discussions.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
