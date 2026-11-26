/*
 * Decent Scan Tool firmware - stage 1: blink.
 *
 * Proves the toolchain, CI build and first flash from the tablet work.
 * The LED blinks once per second and a heartbeat line is printed on the
 * native USB serial console.
 */
#include <stdbool.h>
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "esp_log.h"
#include "esp_app_desc.h"
#include "esp_ota_ops.h"
#include "sdkconfig.h"

#if CONFIG_DST_LED_WS2812
#include "led_strip.h"
static led_strip_handle_t s_strip;
#else
#include "driver/gpio.h"
#endif

static const char *TAG = "dst";

static void led_init(void)
{
#if CONFIG_DST_LED_WS2812
    led_strip_config_t strip_cfg = {
        .strip_gpio_num = CONFIG_DST_LED_GPIO_NUM,
        .max_leds = 1,
    };
    led_strip_rmt_config_t rmt_cfg = {
        .resolution_hz = 10 * 1000 * 1000,
    };
    ESP_ERROR_CHECK(led_strip_new_rmt_device(&strip_cfg, &rmt_cfg, &s_strip));
    led_strip_clear(s_strip);
#else
    gpio_reset_pin(CONFIG_DST_LED_GPIO_NUM);
    gpio_set_direction(CONFIG_DST_LED_GPIO_NUM, GPIO_MODE_OUTPUT);
#endif
}

static void led_set(bool on)
{
#if CONFIG_DST_LED_WS2812
    if (on) {
        led_strip_set_pixel(s_strip, 0, 0, 16, 0); /* dim green */
        led_strip_refresh(s_strip);
    } else {
        led_strip_clear(s_strip);
    }
#else
    gpio_set_level(CONFIG_DST_LED_GPIO_NUM, on);
#endif
}

void app_main(void)
{
    const esp_app_desc_t *desc = esp_app_get_description();
    ESP_LOGI(TAG, "Decent Scan Tool %s (IDF %s)", desc->version, desc->idf_ver);
    ESP_LOGI(TAG, "CAN pins (configured, unused in this stage): TX=%d RX=%d",
             CONFIG_DST_CAN_TX_GPIO, CONFIG_DST_CAN_RX_GPIO);

    /* Mark this image as good so rollback doesn't revert it. */
    esp_ota_mark_app_valid_cancel_rollback();

    led_init();
    bool on = false;
    uint32_t n = 0;
    while (true) {
        on = !on;
        led_set(on);
        if (on) {
            ESP_LOGI(TAG, "blink %lu", (unsigned long)n++);
        }
        vTaskDelay(pdMS_TO_TICKS(500));
    }
}
