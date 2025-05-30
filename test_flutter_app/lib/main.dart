import 'package:flutter/material.dart';

void main() {
  runApp(MyApp());
}

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Flutter Debug Test',
      theme: ThemeData(
        primarySwatch: Colors.blue,
      ),
      home: MyHomePage(title: 'Test Copilot Chat Fix'),
    );
  }
}

class MyHomePage extends StatefulWidget {
  MyHomePage({Key? key, required this.title}) : super(key: key);
  final String title;

  @override
  _MyHomePageState createState() => _MyHomePageState();
}

class _MyHomePageState extends State<MyHomePage> {
  int _counter = 0;

  void _incrementCounter() {
    setState(() {
      _counter++;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.title),
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: <Widget>[
            Text(
              'Testing Copilot Chat Integration',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            SizedBox(height: 20),
            Text(
              'Counter: $_counter',
              style: Theme.of(context).textTheme.headline4,
            ),
            SizedBox(height: 20),
            // This Row will cause an overflow error for testing
            Row(
              children: [
                Container(
                  width: 400, 
                  height: 60, 
                  color: Colors.red,
                  child: Center(child: Text('Box 1', style: TextStyle(color: Colors.white))),
                ),
                Container(
                  width: 400, 
                  height: 60, 
                  color: Colors.blue,
                  child: Center(child: Text('Box 2', style: TextStyle(color: Colors.white))),
                ),
                Container(
                  width: 400, 
                  height: 60, 
                  color: Colors.green,
                  child: Center(child: Text('Box 3', style: TextStyle(color: Colors.white))),
                ),
              ],
            ),
            SizedBox(height: 20),
            Text(
              'The row above should cause an overflow error.',
              style: TextStyle(fontSize: 12, fontStyle: FontStyle.italic),
            ),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: _incrementCounter,
        tooltip: 'Increment',
        child: Icon(Icons.add),
      ),
    );
  }
}
