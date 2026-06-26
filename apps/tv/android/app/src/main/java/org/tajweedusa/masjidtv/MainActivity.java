package org.tajweedusa.masjidtv;

import android.content.Context;
import android.net.ConnectivityManager;
import android.net.Network;
import android.net.NetworkCapabilities;
import android.net.NetworkRequest;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.os.SystemClock;
import android.view.View;
import android.view.WindowManager;

import com.getcapacitor.BridgeActivity;

/**
 * The kiosk shell for the prayer-hall screen: fullscreen + immersive, never sleeps,
 * and self-heals when the network returns — e.g. the display started before Wi-Fi was
 * back after a power cut, which would otherwise strand the WebView on an error page.
 */
public class MainActivity extends BridgeActivity {

  private ConnectivityManager connectivity;
  private ConnectivityManager.NetworkCallback networkCallback;
  private long lastReloadAt = 0;

  @Override
  public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    // Always-on wall display: never let the screen sleep.
    getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
    registerNetworkReload();
  }

  @Override
  public void onResume() {
    super.onResume();
    hideSystemBars();
  }

  @Override
  public void onWindowFocusChanged(boolean hasFocus) {
    super.onWindowFocusChanged(hasFocus);
    if (hasFocus) {
      hideSystemBars();
    }
  }

  @Override
  public void onDestroy() {
    if (connectivity != null && networkCallback != null) {
      try {
        connectivity.unregisterNetworkCallback(networkCallback);
      } catch (Exception ignored) {
      }
    }
    super.onDestroy();
  }

  /**
   * Reload the display whenever an internet-capable network connects. Covers the
   * post-power-cut case where the app launches a few seconds before the router is up.
   */
  private void registerNetworkReload() {
    connectivity = (ConnectivityManager) getSystemService(Context.CONNECTIVITY_SERVICE);
    if (connectivity == null) {
      return;
    }
    networkCallback = new ConnectivityManager.NetworkCallback() {
      @Override
      public void onAvailable(Network network) {
        reloadDisplaySoon();
      }
    };
    NetworkRequest request = new NetworkRequest.Builder()
        .addCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET)
        .build();
    try {
      connectivity.registerNetworkCallback(request, networkCallback);
    } catch (Exception e) {
      networkCallback = null;
    }
  }

  /** Reload on the UI thread, debounced so flapping Wi-Fi can't cause a reload storm. */
  private void reloadDisplaySoon() {
    new Handler(Looper.getMainLooper()).post(new Runnable() {
      @Override
      public void run() {
        long now = SystemClock.elapsedRealtime();
        if (now - lastReloadAt < 8000) {
          return;
        }
        lastReloadAt = now;
        if (getBridge() != null && getBridge().getWebView() != null) {
          getBridge().getWebView().reload();
        }
      }
    });
  }

  // Immersive sticky fullscreen — no status/navigation bars on the prayer-hall screen.
  private void hideSystemBars() {
    View decorView = getWindow().getDecorView();
    decorView.setSystemUiVisibility(
        View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
            | View.SYSTEM_UI_FLAG_FULLSCREEN
            | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
            | View.SYSTEM_UI_FLAG_LAYOUT_STABLE
            | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
            | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION);
  }
}
