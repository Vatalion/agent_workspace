import 'package:flutter/material.dart';

class ColorBox extends StatelessWidget {
  final Color color;
  final String text;
  final double width;

  const ColorBox({
    Key? key,
    required this.color,
    required this.text,
    this.width = 400,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      width: width,
      height: 60,
      color: color,
      child: Center(
        child: Text(text, style: const TextStyle(color: Colors.white)),
      ),
    );
  }
}
