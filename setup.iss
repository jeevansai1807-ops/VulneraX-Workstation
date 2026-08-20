[Setup]
AppName=VulneraX
AppVersion=1.0
AppPublisher=VulneraX Security
AppPublisherURL=https://vulnerax.com
DefaultDirName={autopf}\VulneraX
DefaultGroupName=VulneraX
DisableProgramGroupPage=yes
; Output setup file name and icon
OutputDir=C:\Users\ISSEI\vulnerax\dist
OutputBaseFilename=VulneraX_Setup
SetupIconFile=C:\Users\ISSEI\vulnerax\vulnerax.ico
Compression=lzma2
SolidCompression=yes
ArchitecturesInstallIn64BitMode=x64

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked

[Files]
Source: "C:\Users\ISSEI\vulnerax\dist\VulneraX\VulneraX.exe"; DestDir: "{app}"; Flags: ignoreversion
Source: "C:\Users\ISSEI\vulnerax\dist\VulneraX\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs
; Note: Don't use "Flags: ignoreversion" on any shared system files

[Icons]
Name: "{group}\VulneraX"; Filename: "{app}\VulneraX.exe"; IconFilename: "{app}\VulneraX.exe"
Name: "{autodesktop}\VulneraX"; Filename: "{app}\VulneraX.exe"; IconFilename: "{app}\VulneraX.exe"; Tasks: desktopicon

[Run]
Filename: "{app}\VulneraX.exe"; Description: "{cm:LaunchProgram,VulneraX}"; Flags: nowait postinstall skipifsilent
