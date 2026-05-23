# T-Quest Mobile App

Native **React Native (Expo)** app — not a website.

## Run the app

1. Start the Laravel API (from `backend/`):

   ```bash
   php artisan serve --host=0.0.0.0
   ```

2. Start Expo (from `mobile/`):

   ```bash
   npm start
   ```

3. Press **a** for Android emulator or scan the QR code with **Expo Go** on your phone.

## API URL

| Environment | Default URL |
|-------------|-------------|
| Android emulator | `http://10.0.2.2:8000` |
| iOS simulator | `http://127.0.0.1:8000` |
| Physical device | Your PC's LAN IP, e.g. `http://192.168.1.10:8000` |

For a physical device, create `mobile/.env`:

```
EXPO_PUBLIC_API_URL=http://YOUR_PC_IP:8000
```

Then restart Expo.
