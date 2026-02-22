package com.linkcleaner

import android.content.Intent
import android.os.Bundle
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate
import com.facebook.react.bridge.WritableMap
import com.facebook.react.bridge.Arguments
import com.facebook.react.modules.core.DeviceEventManagerModule

class MainActivity : ReactActivity() {

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(null)
    handleSharingIntent(intent)
  }

  override fun onNewIntent(intent: Intent) {
    super.onNewIntent(intent)
    setIntent(intent)
    handleSharingIntent(intent)
  }

  private fun handleSharingIntent(intent: Intent?) {
    if (intent == null) return
    
    when (intent.action) {
      Intent.ACTION_SEND -> {
        if (intent.type?.startsWith("text/") == true) {
          val sharedText = intent.getStringExtra(Intent.EXTRA_TEXT)
          
          if (sharedText != null) {
            sendEventToReactNative("onSharedUrl", sharedText)
          }
        }
      }
      Intent.ACTION_VIEW -> {
        val data = intent.dataString
        if (data != null) {
          sendEventToReactNative("onSharedUrl", data)
        }
      }
    }
  }

  private var pendingUrl: String? = null
  private var retryCount = 0
  
  private fun sendEventToReactNative(eventName: String, url: String) {
    val reactContext = reactNativeHost.reactInstanceManager.currentReactContext
    if (reactContext != null) {
      val params = Arguments.createMap()
      params.putString("url", url)
      
      reactContext
        .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
        .emit(eventName, params)
      
      pendingUrl = null
      retryCount = 0
    } else {
      pendingUrl = url
      
      if (retryCount < 10) { // Max 10 retries (5 seconds)
        retryCount++
        android.os.Handler(android.os.Looper.getMainLooper()).postDelayed({
          sendEventToReactNative(eventName, url)
        }, 500)
      }
    }
  }

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  override fun getMainComponentName(): String = "LinkCleaner"

  /**
   * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
   * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)
}
