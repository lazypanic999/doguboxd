# Doguboxd

Doguboxd, film arama ve izleme günlüğü uygulamasıdır. Canlı film kataloğu, afiş ve ekip bilgileri, izleme listesi, kişisel listeler, yarım yıldızlı puanlama ve arkadaşlarla Zevk rotası sunar.

**Letterboxd aktarımı:** Günlüğüm → Letterboxd’dan aktar bölümünde dışa aktarılan ZIP veya CSV dosyalarını seçin. Günlük tarihleri, tekrar izlemeler, puanlar ve izleme listesi eşleştirilir. Ham dosya cihazda okunur; film adları TMDB üzerinden eşleştirilir. Mevcut Doguboxd kayıtları korunur.

**Canlı site:** https://doguboxd.i-sg-hocam-a-4378.chatgpt.site/

## Proje yapısı

- `web/`: Sitenin ön yüzü, TMDB isteğini sunucuda yapan Worker ve Sites derleme betiği.
- `android/`: Aynı siteyi Android WebView içinde açan APK projesi.

## Web geliştirme

Node.js ile `web/` klasöründe `npm run check` ve `npm run build` komutlarını çalıştırın. Çıktı `web/dist/` içine yazılır. Canlı TMDB araması için dağıtım ortamına `TMDB_READ_ACCESS_TOKEN` adlı sunucu sırrı eklenmelidir. Anahtarı kaynak koduna veya GitHub'a koymayın.

## Android geliştirme

Android Studio ile `android/` klasörünü açın. Android SDK 36 ve JDK 17 gerekir. `gradlew.bat assembleDebug` test APK'sını üretir. Android uygulamasının açtığı adres `android/app/src/main/java/com/doguboxd/app/MainActivity.java` içindedir.

Bu sürümde günlük ve puanlar cihazın yerel depolamasında tutulur; hesaplar arasında eşitlenmez. Android sürümü gerçek cihazda test edilmelidir. Google Play dağıtımı için ayrıca kullanıcıya ait imzalı release AAB gerekir.

Film verileri [TMDB](https://www.themoviedb.org/) kaynaklıdır. This product uses the TMDB API but is not endorsed or certified by TMDB.
