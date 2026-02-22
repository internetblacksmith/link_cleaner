import 'package:equatable/equatable.dart';

class UrlParameter extends Equatable {
  final String key;
  final String value;
  final bool selected;
  final bool isTracker;
  final String? category;

  const UrlParameter({
    required this.key,
    required this.value,
    required this.selected,
    required this.isTracker,
    this.category,
  });

  UrlParameter copyWith({
    String? key,
    String? value,
    bool? selected,
    bool? isTracker,
    String? category,
  }) {
    return UrlParameter(
      key: key ?? this.key,
      value: value ?? this.value,
      selected: selected ?? this.selected,
      isTracker: isTracker ?? this.isTracker,
      category: category ?? this.category,
    );
  }

  String toQueryString() => '$key=$value';

  @override
  List<Object?> get props => [key, value, selected, isTracker, category];

  @override
  bool get stringify => true;
}