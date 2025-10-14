package com.reactnativecometchatuikit;

import android.content.Context;
import android.os.PowerManager;
import android.os.PowerManager.WakeLock;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.module.annotations.ReactModule;
import com.facebook.react.bridge.UiThreadUtil;

@ReactModule(name = ProximityModule.NAME)
public class ProximityModule extends ReactContextBaseJavaModule {

    public static final String NAME = "Proximity";
    private WakeLock wakeLock;

    public ProximityModule(ReactApplicationContext reactContext) {
        super(reactContext);
        try {
            PowerManager pm = (PowerManager) reactContext.getSystemService(Context.POWER_SERVICE);
            wakeLock = pm.newWakeLock(PowerManager.PROXIMITY_SCREEN_OFF_WAKE_LOCK, "cometchat:" + NAME);
        } catch (Throwable t) {
            wakeLock = null;
        }
    }

    @Override
    public String getName() {
        return NAME;
    }

    @ReactMethod
    public void setEnabled(final boolean enabled) {
        if (wakeLock == null) return;

        UiThreadUtil.runOnUiThread(new Runnable() {
            @Override
            public void run() {
                try {
                    if (enabled && !wakeLock.isHeld()) {
                        wakeLock.acquire();
                    } else if (!enabled && wakeLock.isHeld()) {
                        wakeLock.release();
                    }
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }
        });
    }
}
