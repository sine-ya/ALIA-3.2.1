package ma.syndic.alia3;

import android.content.ContentResolver;
import android.content.ContentUris;
import android.content.ContentValues;
import android.content.Context;
import android.database.Cursor;
import android.net.Uri;
import android.os.Build;
import android.provider.MediaStore;
import android.webkit.JavascriptInterface;
import org.json.JSONArray;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;

public class BackupBridge {
  private static final String REL = "Documents/Syndic/";
  private final Context ctx;

  public BackupBridge(Context c) { ctx = c; }

  private Uri col() { return MediaStore.Files.getContentUri("external"); }

  private Uri find(String name) {
    Cursor c = null;
    try {
      c = ctx.getContentResolver().query(col(), new String[]{MediaStore.MediaColumns._ID},
        MediaStore.MediaColumns.DISPLAY_NAME + "=? AND " + MediaStore.MediaColumns.RELATIVE_PATH + " LIKE ?",
        new String[]{name, "Documents/Syndic%"}, null);
      if (c != null && c.moveToFirst()) return ContentUris.withAppendedId(col(), c.getLong(0));
    } catch (Exception e) {
    } finally {
      if (c != null) c.close();
    }
    return null;
  }

  @JavascriptInterface
  public String write(String name, String content) {
    if (Build.VERSION.SDK_INT < 29) return "unsupported";
    ContentResolver r = ctx.getContentResolver();
    byte[] data = content.getBytes(StandardCharsets.UTF_8);
    try {
      Uri u = find(name);
      if (u != null) {
        try (OutputStream o = r.openOutputStream(u, "wt")) {
          o.write(data);
          return "ok";
        } catch (Exception e) {
          // file not owned by this install: fall through and create a new one
        }
      }
      ContentValues v = new ContentValues();
      v.put(MediaStore.MediaColumns.DISPLAY_NAME, name);
      v.put(MediaStore.MediaColumns.MIME_TYPE, "application/json");
      v.put(MediaStore.MediaColumns.RELATIVE_PATH, REL);
      Uri n = r.insert(col(), v);
      if (n == null) return "err:insert";
      try (OutputStream o = r.openOutputStream(n, "wt")) {
        o.write(data);
      }
      return "ok";
    } catch (Exception e) {
      return "err:" + e.getMessage();
    }
  }

  @JavascriptInterface
  public String list() {
    if (Build.VERSION.SDK_INT < 29) return "unsupported";
    JSONArray a = new JSONArray();
    Cursor c = null;
    try {
      c = ctx.getContentResolver().query(col(), new String[]{MediaStore.MediaColumns.DISPLAY_NAME},
        MediaStore.MediaColumns.RELATIVE_PATH + " LIKE ?", new String[]{"Documents/Syndic%"}, null);
      while (c != null && c.moveToNext()) a.put(c.getString(0));
    } catch (Exception e) {
    } finally {
      if (c != null) c.close();
    }
    return a.toString();
  }

  @JavascriptInterface
  public String read(String name) {
    if (Build.VERSION.SDK_INT < 29) return "unsupported";
    try {
      Uri u = find(name);
      if (u == null) return "";
      try (InputStream i = ctx.getContentResolver().openInputStream(u);
           ByteArrayOutputStream b = new ByteArrayOutputStream()) {
        byte[] x = new byte[8192];
        int n;
        while ((n = i.read(x)) > 0) b.write(x, 0, n);
        return b.toString("UTF-8");
      }
    } catch (Exception e) {
      return "";
    }
  }

  @JavascriptInterface
  public String remove(String name) {
    if (Build.VERSION.SDK_INT < 29) return "unsupported";
    try {
      Uri u = find(name);
      if (u != null) ctx.getContentResolver().delete(u, null, null);
      return "ok";
    } catch (Exception e) {
      return "err:" + e.getMessage();
    }
  }
}
