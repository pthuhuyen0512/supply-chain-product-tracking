# Step 07 Public Lookup and QR Acceptance

Physical webcam decoding was confirmed by the user in Edge on 2026-11-16.
The supplied result screenshot shows COFFEE-DEMO-001, Da Lat Arabica, Da Lat,
Vietnam, Delivered, the Customer holder, and all four history events matching
the verified contract state. The wallet is connected in this screenshot;
lookup without MetaMask is supported by separate automated browser evidence.
The user subsequently confirmed both automatic camera indicator shutdown after
decoding and shutdown through Stop camera. Physical camera acceptance is complete.
Use Microsoft Edge on this computer and keep Ganache on the existing workspace.

## Public lookup

1. Open http://127.0.0.1:5173/. You can disconnect the wallet from this page;
   product lookup does not require MetaMask.
2. Enter `COFFEE-DEMO-001` in Trace a product and click Look up.
3. Expect Da Lat Arabica, origin Da Lat, Vietnam, stage Delivered, Customer as holder
   and four history events in the order creation, Distributor, Retailer, Customer.
4. Try an unused ID such as `UNKNOWN-STEP07`. Expect a not-found message and no
   leftover details or history from the previous product.

## Prepare the QR code

1. In QR and camera, enter `COFFEE-DEMO-001` and click Generate QR code.
2. Download QR image. The PNG contains exactly the product ID, with no URL or wallet data.
   A prepared copy also exists at `docs/verification/COFFEE-DEMO-001-qr.png`.
3. Display the downloaded image on a phone or another screen, or print it.
   This is an image transfer, not a connection from the phone to the local website.
   The computer's localhost URL does not refer to this computer when opened on a phone.

## Physical webcam check

1. On the computer, click Open camera and allow the camera in Edge when prompted.
2. Hold the printed QR or the image on another screen in front of the webcam.
3. Expect the scanner to decode once, turn off the camera, and automatically look up
   COFFEE-DEMO-001. Verify Delivered, Customer holder and four history events again.
4. Open the camera a second time, then click Stop camera. Verify that the camera
   preview and browser camera indicator turn off.
5. If possible, start scanning again and switch to another section or tab. The stream
   should stop. Do not change Windows privacy settings or reset Ganache for this test.

If access is denied, expect an English permission message and a working retry button.
If no webcam is available, report that fact: camera acceptance remains unverified.
Scan QR image is a useful fallback and has been automatically tested, but it does
not count as proof that a physical webcam worked.

Report the lookup result and whether the camera indicator stopped after decoding
and after Stop camera. A screenshot of the resulting lookup is useful; do not include
private keys or recovery phrases.
