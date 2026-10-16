package ma.syndic.alia3;

import android.os.Bundle;
import android.print.PrintAttributes;
import android.print.PrintManager;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
  @Override
  public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    final WebView w = getBridge().getWebView();
    w.addJavascriptInterface(new Object() {
      @JavascriptInterface
      public void print() {
        runOnUiThread(new Runnable() {
          public void run() {
            PrintManager pm = (PrintManager) getSystemService(PRINT_SERVICE);
            pm.print("Syndic", w.createPrintDocumentAdapter("Syndic"), new PrintAttributes.Builder().build());
          }
        });
      }
    }, "AndroidPrint");
    w.addJavascriptInterface(new BackupBridge(this), "AndroidBackup");
    w.addJavascriptInterface(new BioBridge(this, w), "AndroidBio");
  }
}
