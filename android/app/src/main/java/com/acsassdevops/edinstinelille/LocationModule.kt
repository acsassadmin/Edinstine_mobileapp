package com.acsassdevops.edinstinelille

import android.content.Intent
import androidx.core.content.ContextCompat
import com.facebook.react.bridge.ReactApplicationContext

class LocationModule(reactContext: ReactApplicationContext) : NativeLocationModuleSpec(reactContext) {

    init {
        LocationService.reactContextStatic = reactContext
    }

    override fun getName(): String = "LocationModule"

    override fun startLocationUpdates() {
        val intent = Intent(reactApplicationContext, LocationService::class.java)
        ContextCompat.startForegroundService(reactApplicationContext, intent)
    }

    override fun stopLocationUpdates() {
        val intent = Intent(reactApplicationContext, LocationService::class.java)
        reactApplicationContext.stopService(intent)
    }
}