@echo off
title Academy Management System - Database Wizard
cd /d "%~dp0server"
node src/scripts/setup-db-wizard.js
pause
