import {
  City,
  CitySearchDto,
  NotificationChannel,
  PaymentMethodDto,
  paymentsClearPaymentMethods,
  paymentsPaymentMethod,
  userMyLocation,
  userUpdate,
} from "@alliance/shared/client";
import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import CityAutosuggest from "../../components/CityAutosuggest";
import FriendsTab from "../../components/FriendsTab";
import Badge from "../../components/system/Badge";
import Button, { ButtonColor } from "../../components/system/Button";
import Card, { CardStyle } from "../../components/system/Card";
import FormInput from "../../components/system/FormInput";
import { AdminOnly } from "../../lib/AdminOnly";
import { useAuth } from "../../lib/AuthContext";

const SettingsPage: React.FC = () => {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [location, setLocation] = useState<City | null>(null);
  const [selectedCityId, setSelectedCityId] = useState<number | null>(null);
  const [anonymous, setAnonymous] = useState<boolean>(false);

  // Notification preferences
  const [turnedOffAllNotifs, setTurnedOffAllNotifs] = useState<boolean>(false);
  const [primaryNotificationChannel, setPrimaryNotificationChannel] =
    useState<NotificationChannel>("email");

  const [originalCityId, setOriginalCityId] = useState<number | null>(null);
  const [originalAnonymous, setOriginalAnonymous] = useState<boolean>(false);

  // Original notification preferences
  const [originalTurnedOffAllNotifs, setOriginalTurnedOffAllNotifs] =
    useState<boolean>(false);
  const [
    originalPrimaryNotificationChannel,
    setOriginalPrimaryNotificationChannel,
  ] = useState<NotificationChannel>("email");

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodDto | null>(
    null
  );
  const [loadingPaymentMethod, setLoadingPaymentMethod] = useState(false);

  const navigate = useNavigate();

  const handleLogout = useCallback(async () => {
    await logout();
    navigate("/login");
  }, [logout, navigate]);

  console.log(user);

  const handleCitySelect = useCallback((city: CitySearchDto) => {
    setSelectedCityId(city.id);
  }, []);

  // Check if there are any changes from original values
  const hasChanges =
    selectedCityId !== originalCityId ||
    anonymous !== originalAnonymous ||
    turnedOffAllNotifs !== originalTurnedOffAllNotifs ||
    primaryNotificationChannel !== originalPrimaryNotificationChannel;

  const loadPaymentMethod = useCallback(async () => {
    try {
      const response = await paymentsPaymentMethod();
      if (response.data) {
        setPaymentMethod(response.data);
      }
    } catch {}
  }, []);

  const handleClearPaymentMethod = useCallback(async () => {
    setLoadingPaymentMethod(true);
    try {
      const clear = await paymentsClearPaymentMethods();
      if (clear.response.ok) {
        setPaymentMethod(null);
      }
    } catch (error) {
      console.error("Failed to clear payment method:", error);
    } finally {
      setLoadingPaymentMethod(false);
    }
  }, []);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      await userUpdate({
        body: {
          cityId: selectedCityId || undefined,
          anonymous: anonymous,
          turnedOffAllNotifs: turnedOffAllNotifs,
          primaryNotificationChannel: primaryNotificationChannel,
        },
      });

      // Refresh the location data
      const locationResponse = await userMyLocation();
      if (locationResponse.data) {
        setLocation(locationResponse.data);
      }

      // Update original values to reflect the saved state
      setOriginalCityId(selectedCityId);
      setOriginalAnonymous(anonymous);
      setOriginalTurnedOffAllNotifs(turnedOffAllNotifs);
      setOriginalPrimaryNotificationChannel(primaryNotificationChannel);
    } catch (error) {
      console.error("Failed to save settings:", error);
    } finally {
      setSaving(false);
    }
  }, [
    selectedCityId,
    anonymous,
    turnedOffAllNotifs,
    primaryNotificationChannel,
  ]);

  useEffect(() => {
    if (user) {
      setLoading(false);
      setAnonymous(user.anonymous || false);
      setOriginalAnonymous(user.anonymous || false);

      // Initialize notification preferences from user data
      setTurnedOffAllNotifs(user.turnedOffAllNotifs || false);
      setOriginalTurnedOffAllNotifs(user.turnedOffAllNotifs || false);
      setPrimaryNotificationChannel(user.primaryNotificationChannel);
      setOriginalPrimaryNotificationChannel(user.primaryNotificationChannel);

      loadPaymentMethod();
    }
    userMyLocation().then((location) => {
      console.log(location);
      if (location.data) {
        setLocation(location.data);
        setSelectedCityId(location.data.id);
        setOriginalCityId(location.data.id);
      }
    });
  }, [user, loadPaymentMethod]);

  if (loading) {
    return (
      <div className="bg-page pt-20 px-8 md:px-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="!text-3xl mb-2">Account</h2>
          <Card style={CardStyle.White} className="p-8">
            <p className="text-center text-stone-500">
              Loading your account information...
            </p>
          </Card>
        </div>
      </div>
    );
  }
  if (!user) {
    return <div>Not found</div>;
  }

  return (
    <div className="bg-page pt-20 px-8 md:px-16">
      <div className="max-w-4xl mx-auto">
        <Card style={CardStyle.White} className="p-8 mb-6 relative gap-y-4">
          <div className="flex justify-between mb-2">
            <div className="gap-x-2">
              <h2 className="!text-3xl mb-2">Account</h2>
              <AdminOnly>
                <Badge className="!bg-yellow-600 text-white">Admin</Badge>
              </AdminOnly>
            </div>
            <Button
              onClick={handleLogout}
              color={ButtonColor.Stone}
              className="px-4"
            >
              Log Out
            </Button>
          </div>
          <div>
            <p className="mb-1">
              Name{" "}
              {user.anonymous ? (
                <i className="text-gray-500">(Not shown)</i>
              ) : (
                ""
              )}
            </p>
            <FormInput
              name="name"
              type="text"
              value={user.name || ""}
              onChange={() => {}}
              disabled
            />
          </div>

          <div>
            <p className="mb-1">
              Email <i className="text-gray-500">(Not shown)</i>
            </p>
            <FormInput
              name="email"
              type="email"
              value={user.email || ""}
              onChange={() => {}}
              disabled
            />
          </div>

          <div>
            <label className="block font-medium mb-2">Location</label>
            <CityAutosuggest
              onSelect={handleCitySelect}
              placeholder={location?.name || "Select a city"}
            />
          </div>

          <div>
            <label className="block font-medium  mb-2">Anonymous Account</label>
            <div className="flex flex-row gap-x-2">
              <Button
                color={
                  anonymous === true ? ButtonColor.Black : ButtonColor.Light
                }
                onClick={() => setAnonymous(true)}
              >
                Yes
              </Button>
              <Button
                color={
                  anonymous === false ? ButtonColor.Black : ButtonColor.Light
                }
                onClick={() => setAnonymous(false)}
              >
                No
              </Button>
            </div>
          </div>

          {hasChanges && (
            <div className="flex flex-row absolute bottom-5 right-5">
              <Button
                color={ButtonColor.Green}
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          )}
          <h2 className="text-lg mt-6">Notifications</h2>

          <div className="mb-2">
            <label className="block font-medium mb-2">All Notifications</label>
            <div className="flex flex-row gap-x-2">
              <Button
                color={
                  turnedOffAllNotifs === false
                    ? ButtonColor.Black
                    : ButtonColor.Light
                }
                onClick={() => setTurnedOffAllNotifs(false)}
              >
                Enabled
              </Button>
              <Button
                color={
                  turnedOffAllNotifs === true
                    ? ButtonColor.Black
                    : ButtonColor.Light
                }
                onClick={() => setTurnedOffAllNotifs(true)}
              >
                Disabled
              </Button>
            </div>
            {turnedOffAllNotifs && (
              <p className="text-sm text-gray-500 mt-2">
                You will not receive any notifications when this is disabled.
                Please keep this on if you want to participate as an Alliance
                member!
              </p>
            )}
          </div>

          <div>
            <label className="block font-medium mb-2">
              Primary Notification Channel
            </label>
            <div className="flex flex-row gap-x-2">
              <Button
                color={
                  primaryNotificationChannel === "email"
                    ? ButtonColor.Black
                    : ButtonColor.Light
                }
                onClick={() => setPrimaryNotificationChannel("email")}
                disabled={turnedOffAllNotifs}
              >
                Email
              </Button>
              <Button
                color={
                  primaryNotificationChannel === "text"
                    ? ButtonColor.Black
                    : ButtonColor.Light
                }
                onClick={() => setPrimaryNotificationChannel("text")}
                disabled={turnedOffAllNotifs}
              >
                Text/SMS
              </Button>
            </div>
            {turnedOffAllNotifs && (
              <p className="text-sm text-gray-500 mt-2">
                Enable notifications to select a primary channel.
              </p>
            )}
          </div>
        </Card>

        {paymentMethod !== null && (
          <Card style={CardStyle.White} className="p-8 mb-6">
            <h2 className="text-lg mb-6 -mt-2">Payment Methods</h2>
            <div className="flex items-center justify-between p-4 bg-gray-100 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="flex items-center justify-center p-2 h-5 bg-blue-500 text-white text-xs font-semibold rounded">
                  {paymentMethod.brand?.toUpperCase() || "CARD"}
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    •••• •••• •••• {paymentMethod.last4}
                  </p>
                  <p className="text-sm text-gray-500">
                    Expires{" "}
                    {paymentMethod.exp_month?.toString().padStart(2, "0")}/
                    {paymentMethod.exp_year}
                  </p>
                </div>
              </div>
              <button
                onClick={handleClearPaymentMethod}
                disabled={loadingPaymentMethod}
                className="flex items-center justify-center w-8 h-8 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                title="Remove payment method"
              >
                {loadingPaymentMethod ? (
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                ) : (
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                )}
              </button>
            </div>
          </Card>
        )}

        <FriendsTab userId={user.id} />
      </div>
    </div>
  );
};

export default SettingsPage;
