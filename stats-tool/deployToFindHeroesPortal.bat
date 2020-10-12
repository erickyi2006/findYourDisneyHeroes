@echo off
set DEST1=C:\projects\tutorials\disney-heroes\src\client\findYourDisneyHeroesClient\src\assets\json
set DEST=%DEST1%
copy output\*.json %DEST%
copy input\lookupRoles.json %DEST%
