package com.acsassdevops.edinstinelille

import com.facebook.react.TurboReactPackage 
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.model.ReactModuleInfo
import com.facebook.react.module.model.ReactModuleInfoProvider

class LocationPackage : TurboReactPackage() {
    override fun getModule(name: String, reactContext: ReactApplicationContext): NativeModule? {
        return if (name == "LocationModule") {
            LocationModule(reactContext)
        } else {
            null
        }
    }

    override fun getReactModuleInfoProvider(): ReactModuleInfoProvider {
        return ReactModuleInfoProvider {
            mapOf(
                "LocationModule" to ReactModuleInfo(
                    "LocationModule",
                    "LocationModule",
                    false,
                    false, 
                    false,
                    false, 
                    true  
                )
            )
        }
    }
}