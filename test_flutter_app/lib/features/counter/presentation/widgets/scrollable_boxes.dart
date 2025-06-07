import 'package:flutter/material.dart';

import 'color_box.dart';

class ScrollableBoxes extends StatefulWidget {
  const ScrollableBoxes({Key? key}) : super(key: key);

  @override
  State<ScrollableBoxes> createState() => _ScrollableBoxesState();
}

class _ScrollableBoxesState extends State<ScrollableBoxes> {
  bool _causeOverflow = true;

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Text('Toggle Overflow:'),
            const SizedBox(width: 8),
            Switch(
              value: _causeOverflow,
              onChanged: (value) {
                setState(() {
                  _causeOverflow = value;
                });
              },
            ),
          ],
        ),
        const SizedBox(height: 8),
        // This will show either the overflowing Row or a SingleChildScrollView
        _causeOverflow ? _buildOverflowingRow() : _buildScrollableRow(),
        const SizedBox(height: 20),
        Text(
          _causeOverflow
              ? 'The row above causes an overflow error.'
              : 'The row above is scrollable and prevents overflow.',
          style: const TextStyle(fontSize: 12, fontStyle: FontStyle.italic),
        ),
      ],
    );
  }

  // This row will cause an overflow error for testing
  Widget _buildOverflowingRow() {
    return Row(
      children: const [
        ColorBox(color: Colors.red, text: 'Box 1'),
        ColorBox(color: Colors.blue, text: 'Box 2'),
        ColorBox(color: Colors.green, text: 'Box 3'),
      ],
    );
  }

  // This row uses SingleChildScrollView to prevent overflow
  Widget _buildScrollableRow() {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Row(
        children: const [
          ColorBox(color: Colors.red, text: 'Box 1'),
          ColorBox(color: Colors.blue, text: 'Box 2'),
          ColorBox(color: Colors.green, text: 'Box 3'),
        ],
      ),
    );
  }
}
