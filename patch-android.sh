set -e
M=android/app/src/main/AndroidManifest.xml
sed -i 's#<application#<application android:requestLegacyExternalStorage="true"#' "$M"
sed -i 's#<application#<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" android:maxSdkVersion="28" />\n    <application#' "$M"
mkdir -p android/app/src/main/java/ma/syndic/alia3
cp android-overrides/MainActivity.java android/app/src/main/java/ma/syndic/alia3/MainActivity.java
cp android-overrides/BackupBridge.java android/app/src/main/java/ma/syndic/alia3/BackupBridge.java
cp android-overrides/BioBridge.java android/app/src/main/java/ma/syndic/alia3/BioBridge.java
sed -i '/^dependencies {/a\    implementation "androidx.biometric:biometric:1.1.0"' android/app/build.gradle
cp node_modules/html2canvas/dist/html2canvas.min.js www/html2canvas.min.js
cp node_modules/jspdf/dist/jspdf.umd.min.js www/jspdf.umd.min.js
