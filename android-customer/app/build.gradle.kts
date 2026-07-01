plugins {
    id("com.android.application")
}

android {
    namespace = "ve.tumarca.cliente"
    compileSdk = 34

    defaultConfig {
        applicationId = "ve.tumarca.cliente"
        minSdk = 21
        targetSdk = 34
        versionCode = 1
        versionName = "1.0.0"
    }

    signingConfigs {
        create("release") {
            storeFile = file("../../android.keystore")
            storePassword = "tumarca2024"
            keyAlias = "android"
            keyPassword = "tumarca2024"
        }
    }

    buildTypes {
        release {
            signingConfig = signingConfigs.getByName("release")
            isMinifyEnabled = false
        }
    }
}

dependencies {
    implementation("com.google.androidbrowserhelper:androidbrowserhelper:2.5.0")
}
