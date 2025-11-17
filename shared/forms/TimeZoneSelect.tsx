const TimeZoneSelect = (
  props: React.SelectHTMLAttributes<HTMLSelectElement>
) => {
  return (
    <select {...props}>
      {/* https://en.wikipedia.org/wiki/List_of_tz_database_time_zones */}
      <option value="Etc/GMT+12">(GMT -12:00) Eniwetok, Kwajalein</option>
      <option value="Pacific/Midway">(GMT -11:00) Midway Island, Samoa</option>
      <option value="Pacific/Honolulu">(GMT -10:00) Hawaii</option>
      <option value="Pacific/Marquesas">(GMT -9:30) Taiohae</option>
      <option value="America/Anchorage">(GMT -9:00) Alaska</option>
      <option value="America/Los_Angeles">
        (GMT -8:00) Pacific Time (US &amp; Canada)
      </option>
      <option value="America/Denver">
        (GMT -7:00) Mountain Time (US &amp; Canada)
      </option>
      <option value="America/Chicago">
        (GMT -6:00) Central Time (US &amp; Canada), Mexico City
      </option>
      <option value="America/New_York">
        (GMT -5:00) Eastern Time (US &amp; Canada), Bogota, Lima
      </option>
      <option value="America/Caracas">(GMT -4:30) Caracas</option>
      <option value="America/Halifax">
        (GMT -4:00) Atlantic Time (Canada), Caracas, La Paz
      </option>
      <option value="America/St_Johns">(GMT -3:30) Newfoundland</option>
      <option value="America/Sao_Paulo">
        (GMT -3:00) Brazil, Buenos Aires, Georgetown
      </option>
      <option value="Atlantic/South_Georgia">(GMT -2:00) Mid-Atlantic</option>
      <option value="Atlantic/Azores">
        (GMT -1:00) Azores, Cape Verde Islands
      </option>
      <option value="Europe/London">
        (GMT) Western Europe Time, London, Lisbon, Casablanca
      </option>
      <option value="Europe/Paris">
        (GMT +1:00) Brussels, Copenhagen, Madrid, Paris
      </option>
      <option value="Africa/Johannesburg">
        (GMT +2:00) Kaliningrad, South Africa
      </option>
      <option value="Europe/Moscow">
        (GMT +3:00) Baghdad, Riyadh, Moscow, St. Petersburg
      </option>
      <option value="Asia/Tehran">(GMT +3:30) Tehran</option>
      <option value="Asia/Dubai">
        (GMT +4:00) Abu Dhabi, Muscat, Baku, Tbilisi
      </option>
      <option value="Asia/Kabul">(GMT +4:30) Kabul</option>
      <option value="Asia/Karachi">
        (GMT +5:00) Ekaterinburg, Islamabad, Karachi, Tashkent
      </option>
      <option value="Asia/Kolkata">
        (GMT +5:30) Bombay, Calcutta, Madras, New Delhi
      </option>
      <option value="Asia/Kathmandu">(GMT +5:45) Kathmandu, Pokhara</option>
      <option value="Asia/Dhaka">(GMT +6:00) Almaty, Dhaka, Colombo</option>
      <option value="Asia/Yangon">(GMT +6:30) Yangon, Mandalay</option>
      <option value="Asia/Bangkok">(GMT +7:00) Bangkok, Hanoi, Jakarta</option>
      <option value="Asia/Singapore">
        (GMT +8:00) Beijing, Perth, Singapore, Hong Kong
      </option>
      <option value="Australia/Eucla">(GMT +8:45) Eucla</option>
      <option value="Asia/Tokyo">
        (GMT +9:00) Tokyo, Seoul, Osaka, Sapporo, Yakutsk
      </option>
      <option value="Australia/Darwin">(GMT +9:30) Adelaide, Darwin</option>
      <option value="Australia/Sydney">
        (GMT +10:00) Eastern Australia, Guam, Vladivostok
      </option>
      <option value="Australia/Lord_Howe">(GMT +10:30) Lord Howe Island</option>
      <option value="Pacific/Guadalcanal">
        (GMT +11:00) Magadan, Solomon Islands, New Caledonia
      </option>
      <option value="Pacific/Norfolk">(GMT +11:30) Norfolk Island</option>
      <option value="Pacific/Auckland">
        (GMT +12:00) Auckland, Wellington, Fiji, Kamchatka
      </option>
      <option value="Pacific/Chatham">(GMT +12:45) Chatham Islands</option>
      <option value="Pacific/Apia">(GMT +13:00) Apia, Nukualofa</option>
      <option value="Pacific/Kiritimati">
        (GMT +14:00) Line Islands, Tokelau
      </option>
    </select>
  );
};

export default TimeZoneSelect;
