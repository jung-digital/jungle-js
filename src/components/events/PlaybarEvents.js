'use strict';

/*============================================*\
 * Imports
 \*============================================*/
import Event from '../../lib/core/util/Event';

/*============================================*\
 * Constants
 \*============================================*/
export default Event.generateEventList([
  {type: 'CHANGE', description: 'Called when the current position of the playbar is changed by user interaction.'}
]);
