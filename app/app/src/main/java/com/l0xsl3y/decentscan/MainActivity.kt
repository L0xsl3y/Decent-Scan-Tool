package com.l0xsl3y.decentscan

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.l0xsl3y.decentscan.ui.DecentScanTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            DecentScanTheme {
                Scaffold { inner ->
                    Column(
                        modifier = Modifier.fillMaxSize().padding(inner).padding(24.dp),
                        verticalArrangement = Arrangement.Center,
                        horizontalAlignment = Alignment.CenterHorizontally,
                    ) {
                        Text("Decent Scan", style = MaterialTheme.typography.headlineMedium)
                        Text("Version ${BuildConfig.VERSION_NAME}")
                        Text("Stage 1: app skeleton. Connecting to the scan tool arrives in stage 3.")
                    }
                }
            }
        }
    }
}
