# Doguboxd Android

Doguboxd sitesini Android uygulamasında açan ilk sürüm. Film arama, afiş ve ekip bilgileri, izleme listesi, günlük, yarım yıldızlı puanlama ve Zevk rotası sitedeki özellikleri kullanır.

Günlükteki **Letterboxd’dan aktar** düğmesi Android sistem dosya seçicisini açar. Letterboxd dışa aktarım ZIP dosyası veya içindeki günlük/puan CSV dosyaları seçilebilir.

## Kurulum ve geliştirme

- Android Studio ile bu klasörü açın.
- Android SDK 36 ve JDK 17 kurulu olmalı.
- `gradlew.bat assembleDebug` komutu yerel test APK'sını üretir: `app/build/outputs/apk/debug/app-debug.apk`.
- APK'yı Android 8.0 (API 26) veya üstü bir telefona yükleyin.

Uygulama `https://doguboxd.i-sg-hocam-a-4378.chatgpt.site/` adresini açar. Film bilgileri TMDB üzerinden sunucuda alınır; API anahtarı APK içinde bulunmaz.

## Google Play'e geçiş

Bu dosya bir **debug APK**'dır; Google Play'e yüklenemez. Mağaza sürümü için kullanıcıya ait Play Console hesabı ve imzalama anahtarıyla **signed release AAB** üretilmesi gerekir. Site genel kullanıma açılmadan uygulama diğer kullanıcılar için çalışmaz. Kullanıcı günlükleri şu anda telefonun WebView yerel depolamasındadır; farklı telefonlara otomatik aktarılmaz.

Bu sürüm, mağazaya gönderilmeden önce gerçek Android cihazda işlev testi ve Play incelemesi gerektirir.
