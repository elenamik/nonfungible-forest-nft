/*
 * @author mattatz / http://mattatz.github.io/
 * */
/*
 * params
 *  theta : the amount of randomization direction
 *  attenuation : the attenuation rate of length
 *  rootRange : the range of segments for branch' parent
 * */
import * as THREE from "three";

export const TreeSpawner = function (params) {
  params = params || {};
  this.theta = params.theta || Math.PI * 0.5;
  this.attenuation = params.attenuation || 0.75;

  this.rootRange = params.rootRange || new THREE.Vector2(0.75, 1.0);
};

TreeSpawner.prototype = {
  spawn(branch, extension) {
    const theta = this.theta;
    const atten = this.attenuation;

    const htheta = theta * 0.5;
    const x = Math.random() * theta - htheta;
    const z = Math.random() * theta - htheta;
    const len = branch.length * atten;

    const rot = new THREE.Matrix4();
    const euler = new THREE.Euler(x, 0, z);
    rot.makeRotationFromEuler(euler);
    rot.multiply(branch.rotation);

    let segmentIndex;
    extension = extension || false;
    if (extension) {
      segmentIndex = branch.segments.length - 1;
    } else {
      segmentIndex = Math.floor(
        (Math.random() * (this.rootRange.y - this.rootRange.x) + this.rootRange.x) * branch.segments.length,
      );
    }

    const segment = branch.segments[segmentIndex];
    return new TreeBranch({
      from: segment,
      rotation: rot,
      length: len,
      uvOffset: segment.uvOffset,
      uvLength: branch.uvLength,
      generation: branch.generation + 1,
      generations: branch.generations,
      radius: branch.radius,
      radiusSegments: branch.radiusSegments,
      heightSegments: branch.heightSegments,
    });
  },
};

/*
 * params
 *  from : THREE.Vector3 or TreeSegment
 *  rotation : THREE.Matrix4
 *  length : Number
 *  generation : branch' generation from root
 *  generations : the # of generations
 * */
export const TreeBranch = function (params) {
  const from = params.from;
  this.rotation = params.rotation;
  this.length = params.length;

  this.generation = params.generation || 0;
  this.generations = params.generations;

  this.uvLength = params.uvLength || 10.0;
  this.uvOffset = params.uvOffset || 0.0;
  this.radius = params.radius || 0.1;
  this.radiusSegments = params.radiusSegments;
  this.heightSegments = params.heightSegments;

  if (from instanceof TreeSegment) {
    this.from = from;
    // this.position = from.position;
    this.position = from.position.clone().add(new THREE.Vector3(0, 1, 0).applyMatrix4(from.rotation).setLength(0.05));
  } else if (from instanceof THREE.Vector3) {
    this.from = null; // root branch
    this.position = from;
  } else {
    console.warning("from argument is missing !");
  }

  const direction = new THREE.Vector3(0, 1, 0).applyMatrix4(this.rotation);
  this.to = this.position.clone().add(direction.setLength(this.length));

  this.segments = this.buildTreeSegments(this.radius, this.radiusSegments, direction, this.heightSegments);
  this.children = [];
};

TreeBranch.prototype = {
  buildTreeSegments(radius, radiusSegments, direction, heightSegments) {
    // randomize control point
    const theta = Math.PI * 0.25;
    const htheta = theta * 0.5;
    const x = Math.random() * theta - htheta;
    const z = Math.random() * theta - htheta;
    const rot = new THREE.Matrix4();
    const euler = new THREE.Euler(x, 0, z);
    rot.makeRotationFromEuler(euler);
    direction.applyMatrix4(rot);
    const controlPoint = this.position.clone().add(direction.setLength(this.length * 0.5));

    const curve = new THREE.CatmullRomCurve3([this.position, controlPoint, this.to]);

    const fromRatio = this.generation == 0 ? 1.0 : 1.0 - this.generation / (this.generations + 1);
    const toRatio = 1.0 - (this.generation + 1) / (this.generations + 1);

    const fromRadius = radius * fromRatio;
    const toRadius = radius * toRatio;

    const rotation = this.rotation;

    const segments = [];
    const uvLength = this.uvLength;
    let uvOffset = this.uvOffset;
    const points = curve.getPoints(heightSegments);

    if (this.from !== null) {
      uvOffset += this.from.position.distanceTo(points[0]) / uvLength;
    }

    segments.push(new TreeSegment(points[0], rotation, uvOffset, fromRadius, radiusSegments));

    for (let i = 1; i < heightSegments; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];

      const ry = i / (heightSegments - 1);
      var radius = fromRadius + (toRadius - fromRadius) * ry;
      const d = p1.distanceTo(p0);
      uvOffset += d / uvLength;

      const segment = new TreeSegment(p0, rotation, uvOffset, radius, radiusSegments);
      segments.push(segment);
    }

    return segments;
  },

  branch(spawner, count) {
    for (let i = 0; i < count; i++) {
      // MEMO:
      //  at least one child is an extended branch.
      this.spawn(spawner, i == 0);
    }
    this.children.forEach(function (child) {
      child.branch(spawner, count - 1);
    });
  },

  grow(spawner, count) {
    if (this.children.length <= 0) {
      this.branch(spawner, 1);
    } else {
      this.children.forEach(function (child) {
        child.grow(spawner);
      });
    }
  },

  spawn(spawner, extension) {
    const child = spawner.spawn(this, extension);
    this.children.push(child);
  },

  branchlets() {
    if (this.children.length == 0) {
      return this;
    }
    return Array.prototype.concat.apply(
      [],
      this.children.map(function (child) {
        return child.branchlets();
      }),
    );
  },

  calculateLength() {
    const segments = this.segments;
    let length = 0;
    for (let i = 0, n = segments.length - 1; i < n; i++) {
      const p0 = segments[i].position;
      const p1 = segments[i + 1].position;
      length += p0.distanceTo(p1);
    }
    return length;
  },
};

/*
 * position : THREE.Vector3
 * rotation : THREE.Matrix4
 * */
export const TreeSegment = function (position, rotation, uvOffset, radius, radiusSegments) {
  this.position = position;
  this.rotation = rotation;
  this.uvOffset = uvOffset;
  this.radius = radius;

  this.vertices = [];
  this.uvs = [];

  this.build(radius, radiusSegments);
};

TreeSegment.prototype = {
  build(radius, radiusSegments) {
    const thetaLength = Math.PI * 2;
    for (let x = 0; x <= radiusSegments; x++) {
      const u = x / radiusSegments;
      const vertex = new THREE.Vector3(radius * Math.sin(u * thetaLength), 0, radius * Math.cos(u * thetaLength))
        .applyMatrix4(this.rotation)
        .add(this.position);

      this.vertices.push(vertex);
      this.uvs.push(new THREE.Vector2(u, this.uvOffset));
    }
  },
};

export const Tree = function (params, spawner) {
  params = params || {};

  const from = params.from || new THREE.Vector3();
  let rotation = new THREE.Matrix4();
  if (params.rotation) {
    if (params.rotation instanceof THREE.Euler) {
      const euler = params.rotation;
      rotation.makeRotationFromEuler(euler);
    } else if (params.rotation instanceof THREE.Matrix4) {
      rotation = params.rotation;
    }
  }

  const length = params.length || 3.0;
  const uvLength = params.uvLength || 10.0;
  const generations = params.generations !== undefined ? params.generations : 5;

  const radius = params.radius || 0.1;
  this.radiusSegments = params.radiusSegments || 8;
  this.heightSegments = params.heightSegments || 8;

  this.generations = generations;
  this.root = new TreeBranch({
    from,
    rotation,
    length,
    uvLength,
    generation: 0,
    generations: this.generations,
    radius,
    radiusSegments: this.radiusSegments,
    heightSegments: this.heightSegments,
  });

  this.spawner = spawner || new TreeSpawner();
  this.root.branch(this.spawner, this.generations);
};

Tree.prototype = {
  grow(count, spawner) {
    spawner = spawner || this.spawner;

    this.generation++;
    this.root.grow(spawner, count);
  },

  branchlets() {
    return this.root.branchlets();
  },
};
