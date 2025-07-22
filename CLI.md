# Encoder CLI Usage

The Encoder CLI allows you to run encoding, decoding, hashing, and cryptographic operations from the command line using recipe files.

## Installation

```bash
npm install
```

## Basic Usage

### Run a single operation
```bash
npm run cli "Hello World" --operation base64_encode
```

### Run a recipe file
```bash
npm run cli "Hello World" example-recipe.json
```

### Run an inline recipe
```bash
npm run cli "test" --recipe '[{"id":"base64_encode"},{"id":"url_encode"}]'
```

### Save output to file
```bash
npm run cli "Hello World" example-recipe.json --output result.txt
```

## Available Commands

### List all operations
```bash
npm run cli --list
```

### Validate a recipe file
```bash
npm run cli --validate example-recipe.json
```

### Show recipe information
```bash
npm run cli --info example-recipe.json
```

### Help
```bash
npm run cli --help
```

## Recipe File Format

Recipe files are JSON files that define a sequence of operations to perform:

```json
{
  "format": "encoder-recipe",
  "version": "1.0.0",
  "metadata": {
    "name": "My Recipe",
    "description": "Description of what this recipe does",
    "author": "Your Name",
    "created": "2025-01-22T12:00:00Z",
    "tags": ["encoding", "web"],
    "category": "general"
  },
  "operations": [
    {
      "operation": "base64_encode",
      "name": "Base64 Encode",
      "type": "encode",
      "category": "base"
    },
    {
      "operation": "caesar",
      "name": "Caesar Cipher",
      "type": "cipher",
      "category": "cipher",
      "parameters": {
        "shift": 13
      }
    }
  ]
}
```

## Examples

### Basic encoding chain
```bash
# Create input file
echo "Hello World" > input.txt

# Run recipe
npm run cli "$(cat input.txt)" example-recipe.json --output encoded.txt

# View result
cat encoded.txt
```

### Crypto operations with parameters
```json
{
  "format": "encoder-recipe",
  "version": "1.0.0",
  "metadata": {
    "name": "Password Encryption",
    "description": "Encrypt data with password"
  },
  "operations": [
    {
      "operation": "password_encrypt",
      "name": "Password Encrypt (AES-GCM)",
      "type": "crypto",
      "category": "crypto",
      "parameters": {
        "password": "mySecretPassword123"
      }
    }
  ]
}
```

### Hash operations
```json
{
  "format": "encoder-recipe",
  "version": "1.0.0",
  "metadata": {
    "name": "Hash Chain",
    "description": "Multiple hash operations"
  },
  "operations": [
    {
      "operation": "md5",
      "name": "MD5 Hash",
      "type": "hash",
      "category": "hash"
    },
    {
      "operation": "sha256",
      "name": "SHA256 Hash", 
      "type": "hash",
      "category": "hash"
    }
  ]
}
```

## API Integration

The CLI also works with the included API server. You can:

1. Validate recipes through the API
2. Execute recipes remotely
3. Share recipes between different systems

See the API documentation for more details on endpoints and integration.

## Error Handling

The CLI provides detailed error messages for:
- Invalid recipe files
- Unknown operations
- Parameter validation errors
- File I/O errors

Use `--validate` to check recipe files before execution.