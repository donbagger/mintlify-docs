# Dexpaprika documentation guide

This guide explains how to update and maintain the documentation for [docs.dexpaprika.com](https://docs.dexpaprika.com).

## Overview

The documentation consists of:  
- **API Reference** (Generated from `openapi.yml`)
- **Guides & Tutorials** (Manually added Markdown files)
- **Overall Configuration** (`docs.json` handles the main settings)

## Updating the API Reference

The **API Reference** (`api-reference/`) is automatically generated from `openapi.yml`. To update it:

1. Ensure you have the latest `openapi.yml` file. Simply rename your api-rest.yml to openapi.yml and make sure it's in the right directory
2. Run the following command from the root directory:
   ```bash
   npx @mintlify/scraping@latest openapi-file api-reference/openapi.json -o api-reference
   ```
3. This will:
   - Create any **missing directories** based on the API endpoints.
   - **Not delete existing directories**, so it's best to **delete outdated endpoint directories manually** before running the command.
   - If the changes does not create any kind of changes to addition or deletion of endpoints then the command above doesnt need to be executed. The command itself scrapes the openapi.json file in order to create .mdx files to render them properly on site. 

### Keeping a Backup

Before updating `openapi.yml`, it's best to keep a backup:

- The `openapi_backup.yml` file contains the previous version of `openapi.yml` for own reference and easier debugging. The backup file is not used anywhere in the documentation


## Running the Documentation Locally

To test your changes before publishing:

1. **Clone the repository**:
   ```bash
   git clone https://github.com/coinpaprika/dexpaprika-docs
   cd <REPO_NAME>
   ```
2. **Install Mintlify globally** (only needed once):
   ```bash
   npm i -g mintlify
   ```
3. **Run the documentation locally**:
   ```bash
   mintlify dev
   ```
4. Open the provided local URL in your browser to preview the documentation.

## How Files Are Displayed

| **File/Directory**       | **Where It Appears on the Docs Site**  | **Purpose**  |
|-------------------------|-------------------------------------|-------------|
| `introduction.mdx`       | [docs.dexpaprika.com/introduction](https://docs.dexpaprika.com/introduction) | The landing page for documentation. |
| `api-reference/introduction.mdx` | [docs.dexpaprika.com/api-reference/introduction](https://docs.dexpaprika.com/api-reference/introduction) | The introduction for the API Reference section. |
| `api-reference/`        | [docs.dexpaprika.com/api-reference](https://docs.dexpaprika.com/api-reference) | The **technical reference**, generated from `openapi.yml`. |
| `openapi.yml`        | [Main file of the API-REFERENCE](https://docs.dexpaprika.com/api-reference) | This file is our openapi file. |
| `tutorials/`            | [docs.dexpaprika.com/tutorials](https://docs.dexpaprika.com/tutorials) | A collection of tutorial articles. |
| `docs.json`             | **Main settings file** (like an `index.html`) | Controls overall doc settings & navigation. |

## Summary

- **Make changes to openapi.json:** Make changes in the openapi.json file in order to make changes to /api-reference.  
- **Update the API Reference:** Run `npx @mintlify/scraping` after updating `openapi.json` in order to create new directories and .mdx files to render them correctly in the UI.    
- **Test locally:** Clone repo → Install Mintlify → Run `mintlify dev`.  
- **Docs.json controls the settings** and acts as the main configuration file.
- **https://mintlify.com/docs/page** is a place to find all the possible styling for the documentation. 

If you have any questions, reach out to the team. 🚀  
