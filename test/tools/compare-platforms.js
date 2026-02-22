#!/usr/bin/env node

// tools/compare-platforms.js - Tool to compare test results between platforms

const fs = require('fs');
const path = require('path');

class PlatformComparator {
  constructor() {
    this.results = {
      flutter: null,
      reactNative: null
    };
  }

  loadResults() {
    const flutterReport = path.join(__dirname, '../reports/flutter-report.json');
    const rnReport = path.join(__dirname, '../reports/react-native-report.json');

    if (fs.existsSync(flutterReport)) {
      this.results.flutter = JSON.parse(fs.readFileSync(flutterReport, 'utf8'));
    }

    if (fs.existsSync(rnReport)) {
      this.results.reactNative = JSON.parse(fs.readFileSync(rnReport, 'utf8'));
    }
  }

  compareFeatures() {
    if (!this.results.flutter || !this.results.reactNative) {
      console.error('Missing test results. Run tests for both platforms first.');
      return false;
    }

    const flutterFeatures = this.extractFeatures(this.results.flutter);
    const rnFeatures = this.extractFeatures(this.results.reactNative);

    console.log('\n📊 Feature Parity Report\n');
    console.log('=' .repeat(50));

    let allPassed = true;

    // Compare each feature
    const allFeatures = new Set([...Object.keys(flutterFeatures), ...Object.keys(rnFeatures)]);
    
    for (const feature of allFeatures) {
      const flutterResult = flutterFeatures[feature];
      const rnResult = rnFeatures[feature];

      if (!flutterResult) {
        console.log(`❌ ${feature}: Missing in Flutter`);
        allPassed = false;
      } else if (!rnResult) {
        console.log(`❌ ${feature}: Missing in React Native`);
        allPassed = false;
      } else if (flutterResult.passed && rnResult.passed) {
        console.log(`✅ ${feature}: Passed on both platforms`);
      } else {
        console.log(`⚠️  ${feature}:`);
        console.log(`   Flutter: ${flutterResult.passed ? '✅' : '❌'} (${flutterResult.scenarios.passed}/${flutterResult.scenarios.total} scenarios)`);
        console.log(`   React Native: ${rnResult.passed ? '✅' : '❌'} (${rnResult.scenarios.passed}/${rnResult.scenarios.total} scenarios)`);
        allPassed = false;
      }
    }

    console.log('\n' + '=' .repeat(50));
    
    if (allPassed) {
      console.log('✅ All features have parity between platforms!');
    } else {
      console.log('❌ Feature parity issues detected');
    }

    this.generateDetailedReport();
    
    return allPassed;
  }

  extractFeatures(results) {
    const features = {};
    
    for (const feature of results) {
      const name = feature.name;
      const scenarios = feature.elements || [];
      
      const passed = scenarios.filter(s => s.steps.every(step => step.result.status === 'passed'));
      
      features[name] = {
        passed: passed.length === scenarios.length,
        scenarios: {
          total: scenarios.length,
          passed: passed.length
        }
      };
    }
    
    return features;
  }

  generateDetailedReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        flutter: this.getSummary(this.results.flutter),
        reactNative: this.getSummary(this.results.reactNative)
      },
      differences: this.findDifferences()
    };

    fs.writeFileSync(
      path.join(__dirname, '../reports/parity-report.json'),
      JSON.stringify(report, null, 2)
    );

    console.log('\n📄 Detailed report saved to: reports/parity-report.json');
  }

  getSummary(results) {
    if (!results) return { features: 0, scenarios: 0, steps: 0 };
    
    let scenarios = 0;
    let steps = 0;
    
    results.forEach(feature => {
      scenarios += (feature.elements || []).length;
      (feature.elements || []).forEach(scenario => {
        steps += scenario.steps.length;
      });
    });
    
    return {
      features: results.length,
      scenarios,
      steps
    };
  }

  findDifferences() {
    const differences = [];
    
    if (!this.results.flutter || !this.results.reactNative) {
      return differences;
    }

    // Compare execution times
    this.results.flutter.forEach((feature, index) => {
      const rnFeature = this.results.reactNative[index];
      if (!rnFeature) return;

      (feature.elements || []).forEach((scenario, sIndex) => {
        const rnScenario = rnFeature.elements?.[sIndex];
        if (!rnScenario) return;

        scenario.steps.forEach((step, stepIndex) => {
          const rnStep = rnScenario.steps[stepIndex];
          if (!rnStep) return;

          // Compare step results
          if (step.result.status !== rnStep.result.status) {
            differences.push({
              feature: feature.name,
              scenario: scenario.name,
              step: step.name,
              flutter: step.result.status,
              reactNative: rnStep.result.status
            });
          }
        });
      });
    });
    
    return differences;
  }
}

// Run comparison
const comparator = new PlatformComparator();
comparator.loadResults();
const success = comparator.compareFeatures();

process.exit(success ? 0 : 1);