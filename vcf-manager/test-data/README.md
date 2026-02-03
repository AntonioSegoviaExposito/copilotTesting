# Test Data

This directory contains sample VCF files used for manual testing of the VCF Manager application.

## Files

- `test_contacts.vcf` - General test contacts
- `contacts_france.vcf` - French phone number test data
- `contacts_uk.vcf` - UK phone number test data
- `contacts_usa.vcf` - USA phone number test data

## Usage

These files can be imported into the VCF Manager application to test:
- VCF file parsing
- Phone number normalization (different country formats)
- Duplicate detection
- Contact merging
- Multi-file import

## Note

These are **test files only** and are not used by the automated test suite (which uses generated data in `tests/` directory).
