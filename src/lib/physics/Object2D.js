/*============================================
 * A Physical is a 2D physics object
 *============================================*/

class Physical2D {
  reset(forces) {
    this.pos = vec2.create();
    this.vel = vec2.create();
    this.forces = forces || this.forces;
  }

  onFrame(elapsed, context) {
    // Add forces to velocity
    this.forces.forEach(force => {
      vec2.add(this.vel, this.vel, vec2.scale(vec2.create(), force, elapsed));
    });

    // pos = pos + vel * elapsed
    vec2.add(this.pos, this.pos, vec2.scale(vec2.create(), this.vel, elapsed));
  }

  // Object2D()
  constructor(options) {
    options = options || {};
    this.id = options.id || -1; // index of this physical object
    this.pos = options.pos || vec2.create();
    this.vel = options.vel || vec2.create();
    this.forces = options.forces || undefined;
  }
}

export default Physical2D;
