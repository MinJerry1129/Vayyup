package com.dellainfotech.tensorflow;

/**
 * Created by dano on 01/03/17.
 */

import android.content.ContentValues;
import android.content.Context;
import android.database.Cursor;

import android.graphics.Bitmap;
import android.graphics.Bitmap.Config;
import android.graphics.Canvas;
import android.graphics.Matrix;
import android.net.Uri;
import android.os.Build;
import android.os.Environment;
import android.provider.MediaStore;

import com.dellainfotech.tensorflow.utils.ImageUtils;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import org.tensorflow.TensorFlow;
import org.tensorflow.contrib.android.TensorFlowInferenceInterface;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStream;


public class TensorFlowModule extends ReactContextBaseJavaModule {
    private static final String MODEL_FILE = "file:///android_asset/stylize_v1/stylize_quantized.pb";
    private static final String INPUT_NODE = "input";
    private static final String STYLE_NODE = "style_num";
    private static final String OUTPUT_NODE = "transformer/expand/conv3/conv/Sigmoid";
    private static final int NUM_STYLES = 26;

    static {
        System.loadLibrary("tensorflow_inference");
    }

    private final float[] styleVals = new float[NUM_STYLES];
    private Context context;
    private TensorFlowInferenceInterface inferenceInterface;
    private int[] intValues;
    private float[] floatValues;

    private int previewWidth = 0;
    private int previewHeight = 0;
    private int desiredSize = 1024;

    private Bitmap sourceBitmap = null;
    private Bitmap croppedBitmap = null;
    private Matrix frameToCropTransform;
    private Matrix cropToFrameTransform;

    public TensorFlowModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.context = reactContext;
    }

    @Override
    public String getName() {
        return "TensorFlowModule";
    }

    @ReactMethod
    public void getVersion(Promise promise) {
        promise.resolve(TensorFlow.version());
    }

    private String saveImageToStorage(Bitmap bitmap) throws IOException {
        OutputStream imageOutStream;
        String path = "";
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            ContentValues values = new ContentValues();
            values.put(MediaStore.Images.Media.DISPLAY_NAME,
                    "image_screenshot.jpg");
            values.put(MediaStore.Images.Media.MIME_TYPE, "image/jpeg");
            values.put(MediaStore.Images.Media.RELATIVE_PATH,
                    Environment.DIRECTORY_PICTURES);
            Uri uri =
                    this.context.getContentResolver().insert(MediaStore.Images.Media.EXTERNAL_CONTENT_URI,
                            values);
            path = String.valueOf(uri);
            imageOutStream = this.context.getContentResolver().openOutputStream(uri);
        } else {

            String imagesDir =
                    Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_PICTURES).toString();
            File image = new File(imagesDir, "image_screenshot.jpg");
            path = imagesDir;
            imageOutStream = new FileOutputStream(image);
        }


        bitmap.compress(Bitmap.CompressFormat.JPEG, 100, imageOutStream);
        imageOutStream.close();
        return path;

    }

    @ReactMethod
    public void stylize(String uri, int styleIndex, Promise promise) throws IOException {
        inferenceInterface = new TensorFlowInferenceInterface(context.getAssets(), MODEL_FILE);
        try {
            sourceBitmap = MediaStore.Images.Media.getBitmap(this.context.getContentResolver(), Uri.parse(uri));
        } catch (IOException e) {
            e.printStackTrace();
        }
        previewWidth = sourceBitmap.getWidth();
        previewHeight = sourceBitmap.getHeight();
        croppedBitmap = Bitmap.createBitmap(desiredSize, desiredSize, Config.ARGB_8888);
        frameToCropTransform =
                ImageUtils.getTransformationMatrix(
                        previewWidth, previewHeight,
                        desiredSize, desiredSize,
                        0, false);
        cropToFrameTransform = new Matrix();
        frameToCropTransform.invert(cropToFrameTransform);
        final Canvas canvas = new Canvas(croppedBitmap);
        canvas.drawBitmap(sourceBitmap, frameToCropTransform, null);
        intValues = new int[desiredSize * desiredSize];
        floatValues = new float[desiredSize * desiredSize * 3];
        croppedBitmap.getPixels(
                intValues, 0, croppedBitmap.getWidth(), 0, 0, croppedBitmap.getWidth(), croppedBitmap.getHeight());
        for (int i = 0; i < intValues.length; ++i) {
            final int val = intValues[i];
            floatValues[i * 3] = ((val >> 16) & 0xFF) / 255.0f;
            floatValues[i * 3 + 1] = ((val >> 8) & 0xFF) / 255.0f;
            floatValues[i * 3 + 2] = (val & 0xFF) / 255.0f;
        }
        for (int i = 0; i < NUM_STYLES; ++i) {
            if (i == styleIndex) {
                styleVals[styleIndex] = 1.0f;
            } else {
                styleVals[i] = 0.0f;
            }
        }
        inferenceInterface.feed(
                INPUT_NODE, floatValues, 1, croppedBitmap.getWidth(), croppedBitmap.getHeight(), 3);
        inferenceInterface.feed(STYLE_NODE, styleVals, NUM_STYLES);
        inferenceInterface.run(new String[]{OUTPUT_NODE}, false);
        inferenceInterface.fetch(OUTPUT_NODE, floatValues);
        for (int i = 0; i < intValues.length; ++i) {
            intValues[i] =
                    0xFF000000
                            | (((int) (floatValues[i * 3] * 255)) << 16)
                            | (((int) (floatValues[i * 3 + 1] * 255)) << 8)
                            | ((int) (floatValues[i * 3 + 2] * 255));
        }
        croppedBitmap.setPixels(
                intValues, 0, croppedBitmap.getWidth(), 0, 0, croppedBitmap.getWidth(), croppedBitmap.getHeight());
        // get uri object from bitmap
        ByteArrayOutputStream bytes = new ByteArrayOutputStream();
        croppedBitmap.compress(Bitmap.CompressFormat.JPEG, 100, bytes);
//        String path = MediaStore.Images.Media.insertImage(this.context.getContentResolver(), croppedBitmap, "Title", null);
        Bitmap resized = Bitmap.createScaledBitmap(croppedBitmap, previewWidth, previewHeight, true);

        String path = saveImageToStorage(resized);
        // Uri.parse(path)
        // get real path from uri object
        String[] proj = {MediaStore.Images.Media.DATA};
        Cursor cursor = this.context.getContentResolver().query(Uri.parse(path), proj, null, null, null);
        int column_index = cursor.getColumnIndexOrThrow(MediaStore.Images.Media.DATA);
        cursor.moveToFirst();
        String realPath = cursor.getString(column_index);
        cursor.close();
        promise.resolve(realPath);
    }
}
