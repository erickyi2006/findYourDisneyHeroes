@echo off
set DEST2=C:\projects\angular\disney-heroes\src\client\disneyHeroesAdminPortal\src\assets\json
set DEST=%DEST2%
copy output\collections.json %DEST%
copy input\heroes.csv %DEST%\heroes.csv
copy input\lookupRoles.json %DEST%
copy input\lookupFriendships.json %DEST%
