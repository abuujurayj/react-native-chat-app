#import "Proximity.h"
#import <UIKit/UIKit.h>

@implementation Proximity

// Expose this module to React Native
RCT_EXPORT_MODULE();

// Ensure methods run on main queue (we interact with UIKit)
- (dispatch_queue_t)methodQueue {
  return dispatch_get_main_queue();
}

/**
 * Enables / disables the proximity sensor monitoring. On iOS enabling the
 * proximity sensor automatically dims the screen and disables touch controls.
 *
 * @param enabled `YES` to enable proximity (sensor) monitoring; `NO`, otherwise.
 */
RCT_EXPORT_METHOD(setEnabled:(BOOL)enabled)
{
  [[UIDevice currentDevice] setProximityMonitoringEnabled:enabled];
}

@end
