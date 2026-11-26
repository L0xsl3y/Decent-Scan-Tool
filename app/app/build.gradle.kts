plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.compose)
}

// CI passes these from the git tag / run number. Local builds fall back to dev values.
val appVersionName: String = (findProperty("appVersionName") as String?) ?: "0.0.0-dev"
val appVersionCode: Int = (findProperty("appVersionCode") as String?)?.toIntOrNull() ?: 1

android {
    namespace = "com.l0xsl3y.decentscan"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.l0xsl3y.decentscan"
        minSdk = 26
        targetSdk = 35
        versionCode = appVersionCode
        versionName = appVersionName
    }

    signingConfigs {
        // A fixed debug key is committed so every CI build has the same
        // signature: new APKs install over old ones without uninstalling.
        // This key is public. It's only for debug builds, never for a store release.
        getByName("debug") {
            storeFile = file("debug.keystore")
            storePassword = "android"
            keyAlias = "androiddebugkey"
            keyPassword = "android"
        }
    }

    buildTypes {
        debug {
            signingConfig = signingConfigs.getByName("debug")
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions {
        jvmTarget = "17"
    }
    buildFeatures {
        compose = true
        buildConfig = true
    }
}

dependencies {
    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.activity.compose)
    implementation(libs.androidx.lifecycle.runtime.compose)
    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.compose.ui)
    implementation(libs.androidx.compose.ui.tooling.preview)
    implementation(libs.androidx.compose.material3)
}
