<p align="center"> 
	<br/>
		<a href="https://opensource.org/license/gpl-3-0"><img src="https://img.shields.io/badge/License-GPL_v3-blue.svg?color=3F51B5&style=for-the-badge&label=License&logoColor=000000&labelColor=ececec" alt="License: GPLv3">
	<br/>
</p>

## CaseShelf
Caseshelf helps you cataloge and organise your physical media collection. 

## Features
- Track collection items across multiple media types (games, movies and shows)
- Find key metadata about items in your collection
- Separate owned items from wanted ones, for easy reference when expanding your collection
- Add notes for easy reference

## How to Install
Docker
```
services:
  caseshelf:
    image: havocwyrm/caseshelf:latest
    container_name: caseshelf
    restart: unless-stopped
    ports:
      - 3000:3000
```
<!-- Non-Docker -->

## Roadmap
- Import/Export your collection via CSV
- API scraping for metadata
- Library organisation
- Mobile UI Improvements
- Multi user and OAuth 
- More media types (books, manga, vinyl...)
- Mobile apps