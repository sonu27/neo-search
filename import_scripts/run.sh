#!/bin/sh
node import_scripts/0-0-create-csvs.js
node import_scripts/1-1-neo4j-create-users.js
node import_scripts/1-3-create_following_relationships.js
node import_scripts/2-1-neo4j-create-professions.js
node import_scripts/2-3-create-user-professions-relationships.js
node import_scripts/3-1-neo4j-create-skills.js
node import_scripts/3-3-create-user-skills-relationships.js
node import_scripts/4-1-neo4j-create-industries.js
node import_scripts/4-2-create-user-industry-relationships.js
node import_scripts/5-1-neo4j-create-pages.js
node import_scripts/6-1-neo4j-create-projects-and-rels.js
node import_scripts/9-0-delete-es-indices.js
node import_scripts/9-1-send-professions-to-es-from-neo.js
node import_scripts/9-2-send-skills-to-es-from-neo.js
node import_scripts/9-9-send-users-to-es-from-neo.js
