!include "FileFunc.nsh"
!include "LogicLib.nsh"
!include "StrFunc.nsh"
 
# Configuration
 
Name "GScrap Service Application"
OutFile "gscrap-service-installer.exe"
RequestExecutionLevel admin
InstallDir "$PROGRAMFILES\GScrap Service"
InstallDirRegKey HKCU "Software\GScrap Service" "Install_Dir"
ShowInstDetails show
ShowUninstDetails show
 
# Pages
 
Page directory
Page instfiles
 
UninstPage uninstConfirm
UninstPage instfiles
 
# Registry entries
 
Section
  SectionIn 1
 
  # Installation directory
  CreateDirectory $INSTDIR
 
  # Install files
  SetOutPath $INSTDIR
  File /r "..\build\*"
 
  # Desktop shortcut
  CreateShortcut "$DESKTOP\GScrap Service.lnk" "$INSTDIR\gscrap-service.exe" "" "$INSTDIR\gscrap-service.exe" 0 SW_SHOWNORMAL "" "GScrap Service Application"
 
  # Start menu shortcut
  CreateDirectory "$SMPROGRAMS\GScrap Service"
  CreateShortcut "$SMPROGRAMS\GScrap Service\GScrap Service.lnk" "$INSTDIR\gscrap-service.exe" "" "$INSTDIR\gscrap-service.exe" 0 SW_SHOWNORMAL "" "GScrap Service Application"
  CreateShortcut "$SMPROGRAMS\GScrap Service\Uninstall.lnk" "$INSTDIR\uninstall.exe" "" "$INSTDIR\uninstall.exe" 0 SW_SHOWNORMAL "" "Uninstall GScrap Service Application"
 
  # Registry information
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\GScrap Service" "InstallLocation" "$INSTDIR"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\GScrap Service" "DisplayName" "GScrap Service Application"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\GScrap Service" "DisplayVersion" "0.1.0"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\GScrap Service" "Publisher" "FunnyPaper"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\GScrap Service" "UninstallString" "$INSTDIR\uninstall.exe"
 
  # Uninstaller
  WriteUninstaller "$INSTDIR\uninstall.exe"
 
SectionEnd
 
# Uninstaller Section
 
Section "Uninstall"
  # Remove files
  RMDir /r "$INSTDIR"
  RMDir "$INSTDIR"
 
  # Desktop shortcut
  Delete "$DESKTOP\GScrap Service.lnk"
 
  # Start menu shortcuts
  RMDir "$SMPROGRAMS\GScrap Service"
 
  # Registry information
  DeleteRegKey HKLM "Software\GScrap Service"
 
SectionEnd