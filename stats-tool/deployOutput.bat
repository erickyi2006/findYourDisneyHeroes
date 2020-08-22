@echo off
set DEST=C:\projects\tutorials\disney-heroes\src\client\findYourDisneyHeroesClient\src\assets\json
copy output\*.json %DEST%
copy input\lookupRoles.json %DEST%
