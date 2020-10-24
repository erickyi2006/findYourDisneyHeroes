@echo off
set DEST1=C:\projects\angular\disney-heroes\src\client\findYourDisneyHeroesClient\src\assets\json
set DEST=%DEST1%
copy output\*.json %DEST%
copy input\lookupRoles.json %DEST%
