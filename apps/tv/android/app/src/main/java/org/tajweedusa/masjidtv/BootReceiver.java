package org.tajweedusa.masjidtv;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

/** Relaunch the display after a power cycle — including Fire TV's warm "quick boot". */
public class BootReceiver extends BroadcastReceiver {
  @Override
  public void onReceive(Context context, Intent intent) {
    String action = intent.getAction();
    boolean booted =
        Intent.ACTION_BOOT_COMPLETED.equals(action)
            || "android.intent.action.QUICKBOOT_POWERON".equals(action)
            || "com.htc.intent.action.QUICKBOOT_POWERON".equals(action);
    if (booted) {
      Intent launch = new Intent(context, MainActivity.class);
      launch.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
      context.startActivity(launch);
    }
  }
}
