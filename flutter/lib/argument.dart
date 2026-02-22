class ArgumentModel {
  final String key;
  final String value;
  bool selected;

  ArgumentModel({
    required this.key,
    required this.value,
    required this.selected,
  });

  @override
  String toString() {
    return '$key=$value';
  }

  ArgumentModel copyWith({
    String? key,
    String? value,
    bool? selected,
  }) {
    return ArgumentModel(
      key: key ?? this.key,
      value: value ?? this.value,
      selected: selected ?? this.selected,
    );
  }
}
