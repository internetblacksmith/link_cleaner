import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../domain/entities/cleaned_url.dart';
import '../../domain/entities/url_parameter.dart';
import '../../domain/repositories/url_repository.dart';
import '../../domain/usecases/parse_url_usecase.dart';
import '../../data/repositories/url_repository_impl.dart';

// Shared Preferences Provider
final sharedPreferencesProvider = Provider<SharedPreferences>((ref) {
  throw UnimplementedError('SharedPreferences not initialized');
});

// Repository Provider
final urlRepositoryProvider = Provider<UrlRepository>((ref) {
  final prefs = ref.watch(sharedPreferencesProvider);
  return UrlRepositoryImpl(prefs);
});

// Use Case Provider
final parseUrlUseCaseProvider = Provider<ParseUrlUseCase>((ref) {
  final repository = ref.watch(urlRepositoryProvider);
  return ParseUrlUseCase(repository);
});

// State Classes
class UrlCleanerState {
  final CleanedUrl? cleanedUrl;
  final bool isLoading;
  final String? error;
  final bool selectAll;

  const UrlCleanerState({
    this.cleanedUrl,
    this.isLoading = false,
    this.error,
    this.selectAll = true,
  });

  UrlCleanerState copyWith({
    CleanedUrl? cleanedUrl,
    bool? isLoading,
    String? error,
    bool? selectAll,
  }) {
    return UrlCleanerState(
      cleanedUrl: cleanedUrl ?? this.cleanedUrl,
      isLoading: isLoading ?? this.isLoading,
      error: error ?? this.error,
      selectAll: selectAll ?? this.selectAll,
    );
  }
}

// State Notifier
class UrlCleanerNotifier extends StateNotifier<UrlCleanerState> {
  final ParseUrlUseCase _parseUrlUseCase;
  final UrlRepository _repository;

  UrlCleanerNotifier(this._parseUrlUseCase, this._repository)
      : super(const UrlCleanerState());

  Future<void> parseUrl(String url) async {
    state = state.copyWith(isLoading: true, error: null);
    
    try {
      final cleanedUrl = await _parseUrlUseCase.execute(url);
      state = state.copyWith(
        cleanedUrl: cleanedUrl,
        isLoading: false,
      );
      
      // Save to history
      await _repository.saveToHistory(cleanedUrl);
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
    }
  }

  void toggleParameter(int index) {
    if (state.cleanedUrl == null) return;
    
    final parameters = List<UrlParameter>.from(state.cleanedUrl!.parameters);
    parameters[index] = parameters[index].copyWith(
      selected: !parameters[index].selected,
    );
    
    final updatedCleanedUrl = CleanedUrl.fromUrl(
      state.cleanedUrl!.originalUrl,
      parameters,
    );
    
    state = state.copyWith(cleanedUrl: updatedCleanedUrl);
  }

  void toggleSelectAll() {
    if (state.cleanedUrl == null) return;
    
    final newSelectAll = !state.selectAll;
    final parameters = state.cleanedUrl!.parameters.map((p) {
      return p.copyWith(selected: newSelectAll);
    }).toList();
    
    final updatedCleanedUrl = CleanedUrl.fromUrl(
      state.cleanedUrl!.originalUrl,
      parameters,
    );
    
    state = state.copyWith(
      cleanedUrl: updatedCleanedUrl,
      selectAll: newSelectAll,
    );
  }

  void clearAll() {
    if (state.cleanedUrl == null) return;
    
    final parameters = state.cleanedUrl!.parameters.map((p) {
      return p.copyWith(selected: false);
    }).toList();
    
    final updatedCleanedUrl = CleanedUrl.fromUrl(
      state.cleanedUrl!.originalUrl,
      parameters,
    );
    
    state = state.copyWith(
      cleanedUrl: updatedCleanedUrl,
      selectAll: false,
    );
  }

  void reset() {
    state = const UrlCleanerState();
  }
}

// State Notifier Provider
final urlCleanerProvider = StateNotifierProvider<UrlCleanerNotifier, UrlCleanerState>((ref) {
  final parseUrlUseCase = ref.watch(parseUrlUseCaseProvider);
  final repository = ref.watch(urlRepositoryProvider);
  return UrlCleanerNotifier(parseUrlUseCase, repository);
});

// History Provider
final urlHistoryProvider = FutureProvider<List<CleanedUrl>>((ref) async {
  final repository = ref.watch(urlRepositoryProvider);
  return repository.getHistory();
});

// Statistics Provider
final urlStatisticsProvider = FutureProvider<Map<String, int>>((ref) async {
  final repository = ref.watch(urlRepositoryProvider);
  return repository.getStatistics();
});