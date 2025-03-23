# Installing Supabase CLI on Windows

Our script had trouble installing the Supabase CLI automatically. Here's how to install it manually on Windows:

## Option 1: Using Scoop (Recommended)

[Scoop](https://scoop.sh/) is a command-line installer for Windows, similar to Homebrew for Mac.

1. **Install Scoop** (if you don't have it already):
   ```powershell
   # Open PowerShell as Administrator and run:
   Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
   irm get.scoop.sh | iex
   ```

2. **Install Supabase CLI**:
   ```powershell
   scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
   scoop install supabase
   ```

3. **Verify Installation**:
   ```powershell
   supabase --version
   ```

## Option 2: Using Chocolatey

If you prefer [Chocolatey](https://chocolatey.org/):

1. **Install Chocolatey** (if you don't have it already):
   ```powershell
   # Open PowerShell as Administrator and run:
   Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
   ```

2. **Install Supabase CLI**:
   ```powershell
   choco install supabase
   ```

3. **Verify Installation**:
   ```powershell
   supabase --version
   ```

## Option 3: Using npm (Less Reliable on Windows)

This method sometimes has issues with permissions on Windows:

```powershell
npm install -g supabase
```

## Setting Up After Installation

Once installed, set up your Supabase project:

1. **Login to Supabase**:
   ```powershell
   supabase login
   ```
   This will open a browser window to authenticate.

2. **Link Your Project**:
   ```powershell
   supabase link --project-ref PROJECT_REF
   ```
   Replace `PROJECT_REF` with your Supabase project reference (found in your project URL).

3. **Generate Types**:
   ```powershell
   supabase gen types typescript --schema public > lib/database.types.ts
   ```

## Troubleshooting

- If you get permission errors, try running PowerShell as Administrator
- If `supabase` command is not recognized, restart your terminal or computer
- If type generation fails, make sure you have linked your project correctly

## Manual Alternative

If you can't install the CLI, you can manually generate types:

1. Go to your [Supabase project dashboard](https://app.supabase.com/)
2. Click on "API" in the left sidebar
3. Click "TypeScript" in the "Overview" section
4. Copy the generated types
5. Create a file `lib/database.types.ts` and paste the types 