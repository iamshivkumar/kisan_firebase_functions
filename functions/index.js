const functions = require("firebase-functions");

const admin = require("firebase-admin");

admin.initializeApp();

const db = admin.firestore();
const fcm = admin.messaging();

exports.sendToDevice = functions.firestore
    .document("orders/{orderId}").onCreate(async (snapshot) => {
        const order = snapshot.data();
        const user = await db.collection("users").doc(order.customerId).get();
        const payload = {
            notification: {
                title: `Your order successful (ID: ${order.orderId}).`,
                body: `Thank you for your order. You order is ${order.status}.`,
                sound: "default"
            }
        };
        return fcm.sendToDevice(user.data().token, payload);
    }
    );



exports.sendToDevice = functions.firestore
    .document("orders/{orderId}").onUpdate(async (snapshot) => {
        try {
            const before = snapshot.before.data();
            const after = snapshot.after.data();
            if (before.status != after.status) {
                const user = await db.collection("users").doc(after.customerId).get();
                const payload = {
                    notification: {
                        title: `Your order is ${after.status}`,
                        body: `Check you order details (ID: ${after.orderId}).`,
                        sound: "default"
                    }
                };
                return fcm.sendToDevice(user.data().token, payload);
            }
        } catch (error) {
            console.log(error);
        }
    }
    );
