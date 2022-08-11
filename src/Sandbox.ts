export { }
// {
  //   const geo = sketchState.geometrySystem;
  //   const line1 = geo.addLineSegment(0.5, 2, 2.00, 1.50)
  //   sketchState.lineSegments.push(line1);
  //   const line2 = geo.addLineSegment(2, 1, 3, 1)
  //   sketchState.lineSegments.push(line2);

  //   // const startAngle = 1.1888;
  //   // const endAngle = 3.236;// 270 * Math.PI / 180;
  //   const startAngle = (180) * Math.PI / 180;
  //   const endAngle = (270) * Math.PI / 180;
  //   // const startAngle = (90) * Math.PI / 180;
  //   // const endAngle = (180) * Math.PI / 180;
  //   const radius = 0.50;

  //   // const arc = geo.addArc(2, 1.5, radius, startAngle, endAngle);
  //   // const arc = geo.addArc(2, 1.5, radius, 4, 5);

  //   // const arc = geo.addArc(2, 2.5, radius, 3, 4);
  //   const arc = geo.addArc(2, 1.5, radius, startAngle, endAngle);
  //   sketchState.arcs.push(arc);

  //   let state = sketchState.geometrySystem.state;

  //   geo.addConstraint(new LineSegmentFixedPoint(state, line1, Geometry.LineEndPoint.P1));
  //   geo.addConstraint(new LineSegmentFixedPoint(state, line2, Geometry.LineEndPoint.P2));

  //   // geo.addConstraint(new LineArcTangent(line1, Geometry.LineEndPoint.P2, arc, Geometry.ArcEndPoint.START, false));
  //   // geo.addConstraint(new LineArcTangent(line2, Geometry.LineEndPoint.P1, arc, Geometry.ArcEndPoint.END, false));
  //   // geo.addConstraint(new FixedArcRadius(arc, radius));
  //   // // geo.addConstraint(new LineArcIncident(line1, Geometry.LineEndPoint.P2, arc, Geometry.ArcEndPoint.START));
  //   // geo.addConstraint(new LineArcIncident(line2, Geometry.LineEndPoint.P1, arc, Geometry.ArcEndPoint.END));

  //   geo.addConstraint(new LineSegmentAligned(state, line1));
  //   geo.addConstraint(new LineSegmentAligned(state, line2));
  //   // geo.addConstraint(new LineArcIncident(line2, Geometry.LineEndPoint.P2, arc));
  //   line2.setP1(state, line2.x1(state) - 0.5, line2.y1(state) + 0.5);
  //   line2.setP2(state, line2.x2(state) + 1.5, line2.y2(state) + 1.5);
  //   geo.solve();
  //   // state = sketchState.geometrySystem.state;
  //   console.log("startAngle: ", arc.startAngle(state));
  //   console.log("endAngle: ", arc.endAngle(state));
  //   console.log("radius: ", arc.radius(state));
  //   console.log("x: ", arc.x(state));
  //   console.log("y: ", arc.y(state));
  // }
